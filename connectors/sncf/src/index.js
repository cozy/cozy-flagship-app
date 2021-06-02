import ContentScript from '../../connectorLibs/ContentScript'
import {kyScraper} from '../../connectorLibs/utils'
import Minilog from '@cozy/minilog'
const log = Minilog('ContentScript')
Minilog.enable()

monkeyPatch()
class SncfContentScript extends ContentScript {
  async ensureAuthenticated() {
    log.debug('ensureAuthenticated start')
    if (!(await this.checkAuthenticated())) {
      this.log('not authenticated')
      await this.showLoginFormAndWaitForAuthentication()
    }
    return true
  }

  async checkAuthenticated() {
    console.log('before checkAutnenticated')
    try {
      const {redirected} = await kyScraper.get(
        'https://www.oui.sncf/espaceclient/commandes-en-cours',
      )
      return !redirected
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
    await this.runInWorkerUntilTrue('checkAuthenticated')
    await this.bridge.call('setWorkerState', {
      visible: false,
    })
  }

  async fetch() {
    const resp = await kyScraper.get(
      'https://www.oui.sncf/espaceclient/ordersconsultation/showOrdersForAjaxRequest?pastOrder=true&cancelledOrder=false&pageToLoad=1&_=' +
        Date.now(),
    )
    const orders = await resp.scrape(
      {
        fileurl: {
          sel: ".show-for-small-only a[title='Justificatif']",
          attr: 'href',
          parse: (href) => href.replace(':80'),
        },
        vendorRef: '.order__detail [data-auto=ccl_orders_travel_number]',
        // label: {
        //   sel: '.order__top .texte--insecable',
        //   fn: (el) =>
        //     Array.from(el)
        //       .map((e) =>
        //         e.children
        //           .filter((n) => n.type === 'text')
        //           .map((n) => n.data.trim()),
        //       )
        //       .join('-')
        //       .replace(',', ''),
        // },
        date: {
          sel: '.order__detail div:nth-child(2) .texte--important',
          parse: (date) => new Date(date.split('/').reverse().join('-')),
        },
        amount: {
          sel: '.order__detail div:nth-child(3) .texte--important',
          parse: (amount) => parseFloat(amount.replace(' €', '')),
        },
      },
      '.order',
    )

    return await this.saveFiles(
      orders.map((doc) => {
        doc.vendor = 'sncf'
        doc.filename =
          doc.date.toISOString().split('T').shift() +
          '_' +
          doc.vendorRef +
          '_' +
          doc.amount +
          '€.pdf'
        return doc
      }),
      {
        contentType: 'application/pdf',
        fileIdAttributes: ['vendorRef'],
        context: [],
      },
    )
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
