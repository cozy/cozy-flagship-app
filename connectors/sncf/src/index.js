import ContentScript from '../../connectorLibs/ContentScript'
import {kyScraper} from '../../connectorLibs/utils'
import Minilog from '@cozy/minilog'
import waitFor from 'p-wait-for'

const log = Minilog('ContentScript')
Minilog.enable()

monkeyPatch()
class SncfContentScript extends ContentScript {
  async ensureAuthenticated() {
    log.debug('ensureAuthenticated start')
    if (!(await this.checkAuthenticated(5000))) {
      this.log('not authenticated')
      await this.showLoginFormAndWaitForAuthentication()
    }
    return true
  }

  detectLogoutLink() {
    return document.querySelector('.wcc__logout') !== null
  }

  async checkAuthenticated(timeout = Infinity) {
    try {
      await waitFor(this.detectLogoutLink, {timeout, interval: 100})
      return true
    } catch (err) {
      console.warn(err)
      return false
    }
  }

  /**
   * Display the login form in the worker webview and wait for worker event to continue execution
   */
  async showLoginFormAndWaitForAuthentication() {
    log.debug('showLoginFormAndWaitForAuthentication start')

    await this.bridge.call('setWorkerState', {
      url: 'https://www.oui.sncf/espaceclient/identification',
      visible: true,
    })
    await this.runInWorkerUntilTrue({method: 'checkAuthenticated'})
    await this.bridge.call('setWorkerState', {
      visible: false,
    })
  }

  extractBillsFromOrder(order) {
    return Object.values(order.transactions)
      .filter((t) => t.status === 'PAID') // keep only paid transactions and avoid canceled ones
      .map((transaction) => {
        const {amount, id} = transaction
        const date = new Date(transaction.date)
        const train = this.findTicketUriAndReference(id, order.trainFolders)
        if (train) {
          return {
            amount,
            vendor: 'sncf',
            date,
            vendorRef: id,
            fileurl: train.uri,
            filename: `${date.toISOString().split('T').shift()}_${
              train.reference
            }_${amount}€.pdf`,
            fileAttributes: {
              metadata: {
                invoiceNumber: id,
                contentAuthor: 'sncf',
                datetime: date,
                datetimeLabel: 'startDate',
                isSubscription: true,
                startDate: date,
                carbonCopy: true,
              },
            },
          }
        }
      })
  }

  findTicketUriAndReference(vendorRef, trainFolders) {
    const train = trainFolders.find((t) => t.transactionIds.includes(vendorRef))
    if (
      train &&
      train.deliveryMode.type === 'TKD' &&
      train.deliveryMode.receipt.status === 'AVAILABLE'
    ) {
      return {
        uri:
          'https://www.oui.sncf/vsc/aftersale/generateJustificatifVoyage?pdfFileName=' +
          train.deliveryMode.receipt.uri,
        reference: train.reference,
      }
    }
  }

  async fetch(context) {
    const resp = await kyScraper
      .get(
        'https://www.oui.sncf/api/gtw/aftersale/prd/vsa/api/v2/orders/oui-account?ascSort=false&localeParam=fr_FR&pageNumber=1&pageResultsCount=100&statusFilter=ALL',
      )
      .json()

    const orders = resp.orders.filter((o) => o.status === 'VALID')
    const bills = []
    for (const order of orders) {
      bills.push(...this.extractBillsFromOrder(order).filter(Boolean))
    }

    return await this.saveBills(bills, {
      contentType: 'application/pdf',
      fileIdAttributes: ['vendorRef'],
      qualificationLabel: 'transport_invoice',
      context,
    })
  }

  async getUserDataFromWebsite() {
    log('info', 'Fetching Identity')
    const identity = await kyScraper
      .get(
        `https://www.oui.sncf/api/gtw/v2/clients/customers/me?timestamp=${Date.now()}`,
      )
      .json()
    log('info', 'identity', identity.ouiAccount.contact)

    return {
      sourceAccountIdentifier: identity.ouiAccount.contact.email,
    }
  }
}

const connector = new SncfContentScript()
connector.init().catch((err) => {
  console.warn(err)
})

function monkeyPatch() {
  window.open = function (url) {
    document.location = url
  }
}
