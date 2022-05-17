import ContentScript from '../../connectorLibs/ContentScript'
import {blobToBase64} from '../../connectorLibs/utils'
import Minilog from '@cozy/minilog'

const log = Minilog('ContentScript')
Minilog.enable()

const BASE_URL = 'https://espace-client.orange.fr'
const DEFAULT_PAGE_URL = BASE_URL + '/accueil'
const DEFAULT_SOURCE_ACCOUNT_IDENTIFIER = 'orange'

let recentBills = []
let oldBills = []
let recentPromisesToConvertBlobToBase64 = []
let oldPromisesToConvertBlobToBase64 = []
let recentXhrUrls = []
let oldXhrUrls = []

var proxied = window.XMLHttpRequest.prototype.open
window.XMLHttpRequest.prototype.open = function () {
  if (arguments[1].includes('/users/current/contracts')) {
    var originalResponse = this

    originalResponse.addEventListener('readystatechange', function (event) {
      if (originalResponse.readyState === 4) {
        const jsonBills = JSON.parse(originalResponse.responseText)
        recentBills.push(jsonBills)
      }
    })
    return proxied.apply(this, [].slice.call(arguments))
  }
  if (arguments[1].includes('/facture/historicBills?')) {
    var originalResponse = this

    originalResponse.addEventListener('readystatechange', function (event) {
      if (originalResponse.readyState === 4) {
        const jsonBills = JSON.parse(originalResponse.responseText)
        oldBills.push(jsonBills)
      }
    })
    return proxied.apply(this, [].slice.call(arguments))
  }
  if (arguments[1].includes('facture/v1.0/pdf?billDate')) {
    var originalResponse = this
    originalResponse.addEventListener('readystatechange', function (event) {
      if (originalResponse.readyState === 4) {
        recentPromisesToConvertBlobToBase64.push(
          blobToBase64(originalResponse.response),
        )
        recentXhrUrls.push(originalResponse.__zone_symbol__xhrURL)

        return originalResponse
      }
    })
  }
  if (arguments[1].includes('ecd_wp/facture/historicPDF?')) {
    var originalResponse = this
    originalResponse.addEventListener('readystatechange', function (event) {
      if (originalResponse.readyState === 4) {
        oldPromisesToConvertBlobToBase64.push(
          blobToBase64(originalResponse.response),
        )
        oldXhrUrls.push(originalResponse.__zone_symbol__xhrURL)

        return originalResponse
      }
    })
  }
  return proxied.apply(this, [].slice.call(arguments))
}

class OrangeContentScript extends ContentScript {
  /////////
  //PILOT//
  /////////

  async ensureAuthenticated() {
    await this.goto(DEFAULT_PAGE_URL)
    log.debug('waiting for any authentication confirmation or login form...')
    await Promise.race([
      this.runInWorkerUntilTrue({method: 'waitForAuthenticated'}),
      this.waitForElementInWorker('[data-e2e="e2e-ident-button"]'),
    ])
    this.log('After Race')
    if (await this.runInWorker('checkAuthenticated')) {
      this.log('Authenticated')
      return true
    } else {
      await this.waitForUserAuthentication()
      this.log('Not authenticated')
      return true
    }
  }

  async waitForUserAuthentication() {
    log.debug('waitForUserAuthentication start')
    await this.setWorkerState({visible: true, url: DEFAULT_PAGE_URL})
    await this.runInWorkerUntilTrue({method: 'waitForAuthenticated'})
    await this.setWorkerState({visible: false, url: DEFAULT_PAGE_URL})
  }

  async getUserDataFromWebsite() {
    // I think that if we cannot find the user mail, this should not be an connector execution
    // error
    return {
      sourceAccountIdentifier:
        (await this.runInWorker('getUserMail')) ||
        DEFAULT_SOURCE_ACCOUNT_IDENTIFIER,
    }
  }

  async fetch(context) {
    log.debug('fetch start')
    await this.waitForElementInWorker('a[class="ob1-link-icon ml-1 py-1"]')
    const clientRef = await this.runInWorker('findClientRef')
    if (clientRef) {
      this.log('clientRef founded')
      await this.setWorkerState({
        visible: false,
        url: `https://espace-client.orange.fr/facture-paiement/${clientRef}`,
      })
      await this.waitForElementInWorker('[data-e2e="bp-tile-historic"]')
      await this.setWorkerState({
        visible: false,
        url: `https://espace-client.orange.fr/facture-paiement/${clientRef}/historique-des-factures`,
      })
      await this.waitForElementInWorker(
        '[aria-labelledby="bp-billsHistoryTitle"]',
      )

      await this.runInWorker('clickOnPdf')
      this.log('pdfButtons founded and clicked')
      this.store.dataUri = []

      for (let i = 0; i < this.store.resolvedBase64.length; i++) {
        let dateArray = this.store.resolvedBase64[i].href.match(
          /([0-9]{4})-([0-9]{2})-([0-9]{2})/g,
        )
        this.store.resolvedBase64[i].date = dateArray[0]
        const index = this.store.allBills.findIndex(function (bill) {
          return bill.date === dateArray[0]
        })
        this.store.dataUri.push({
          vendor: 'sosh.fr',
          date: this.store.allBills[index].date,
          amount: this.store.allBills[index].amount / 100,
          recurrence: 'monthly',
          vendorRef: this.store.allBills[index].id
            ? this.store.allBills[index].id
            : this.store.allBills[index].tecId,
          filename: `facture_${this.store.allBills[index].date}_sosh_${
            this.store.allBills[index].amount / 100
          }€.pdf`,
          dataUri: this.store.resolvedBase64[i].uri,
          fileAttributes: {
            metadata: {
              invoiceNumber: this.store.allBills[index].id
                ? this.store.allBills[index].id
                : this.store.allBills[index].tecId,
              contentAuthor: 'sosh',
              datetime: this.store.allBills[index].date,
              datetimeLabel: 'startDate',
              isSubscription: true,
              startDate: this.store.allBills[index].date,
              carbonCopy: true,
            },
          },
        })
      }

      await this.saveBills(this.store.dataUri, {
        context,
        fileIdAttributes: ['filename'],
        contentType: 'application/pdf',
        qualificationLabel: 'isp_invoice',
      })
    }

    // Putting a falsy selector allows you to stay on the wanted page for debugging purposes
    // await this.waitForElementInWorker(
    //   '[aria-labelledby="bp-billsHistoryyyTitle"]',
    // )
  }

  findPdfButtons() {
    this.log('Starting findPdfButtons')
    const buttons = Array.from(
      document.querySelectorAll('a[class="icon-pdf-file bp-downloadIcon"]'),
    )
    return buttons
  }

  findMoreBillsButton() {
    this.log('Starting findMoreBillsButton')
    const buttons = Array.from(
      document.querySelectorAll('[data-e2e="bh-more-bills"]'),
    )
    return buttons
  }

  //////////
  //WORKER//
  //////////
  async checkAuthenticated() {
    // If Orange page is detected
    if (
      document.location.href.includes(
        'https://espace-client.orange.fr/page-accueil',
      ) &&
      document.querySelector('[class="is-mobile is-logged"]')
    ) {
      return true
    }
    // If Sosh page is detected
    if (
      document.location.href.includes(
        'https://espace-client.orange.fr/accueil',
      ) &&
      document.querySelector('[id="oecs__connecte-se-deconnecter"]')
    ) {
      return true
    }
    return false
  }
  async getUserMail() {
    // For Sosh page
    const result = document.querySelector(
      '.oecs__zone-footer-button-mail',
    ).innerHTML
    if (result) {
      return result
    }
    return false
  }

  async findClientRef() {
    let parsedElem
    let clientRef
    if (document.querySelector('a[class="ob1-link-icon ml-1 py-1"]')) {
      this.log('Elements founded')
      parsedElem = document
        .querySelectorAll('a[class="ob1-link-icon ml-1 py-1"]')[1]
        .getAttribute('href')

      this.log(parsedElem)
      const clientRefArray = parsedElem.match(/([0-9]*)/g)
      this.log(clientRefArray.length)

      for (let i = 0; i < clientRefArray.length; i++) {
        this.log('Get in loop')

        const testedIndex = clientRefArray.pop()
        this.log('This is length of testIndex')
        this.log(testedIndex)
        if (testedIndex.length === 0) {
          this.log('No clientRef founded')
          this.log(testedIndex.length)
        } else {
          this.log('clientRef founded')
          clientRef = testedIndex
          break
        }
      }
      this.log('this is clientRef')
      return clientRef
    }
  }

  async clickOnPdf() {
    log.debug('Get in clickOnPdf')
    const moreBillsButton = this.findMoreBillsButton()
    if (moreBillsButton.length !== 0) {
      this.log('moreBillsButton founded,clicking on it')
      moreBillsButton[0].click()
      this.log('moreBillsButton clicked')
      await sleep(5)
    }
    let buttons = this.findPdfButtons()
    if (buttons[0].length === 0) {
      this.log('ERROR Could not find pdf button')
      return 'VENDOR_DOWN'
    } else {
      for (const button of buttons) {
        this.log('will click one pdf')
        button.click()
        this.log('pdfButton clicked')
        sleep(3)
      }
    }
    await sleep(15)
    let resolvedBase64 = []
    this.log('Awaiting promises')
    const recentToBase64 = await Promise.all(
      recentPromisesToConvertBlobToBase64,
    )
    const oldToBase64 = await Promise.all(oldPromisesToConvertBlobToBase64)
    this.log('Processing promises')
    const promisesToBase64 = recentToBase64.concat(oldToBase64)
    const xhrUrls = recentXhrUrls.concat(oldXhrUrls)
    for (let i = 0; i < promisesToBase64.length; i++) {
      resolvedBase64.push({
        uri: promisesToBase64[i],
        href: xhrUrls[i],
      })
    }
    const recentBillsToAdd = recentBills[0].billsHistory.billList
    const oldBillsToAdd = oldBills[0].oldBills
    let allBills = recentBillsToAdd.concat(oldBillsToAdd)
    log.debug('Sending to pilot')
    await this.sendToPilot({
      resolvedBase64,
      allBills,
    })
    return true
  }
}

const connector = new OrangeContentScript()
connector
  .init({
    additionalExposedMethodsNames: [
      'getUserMail',
      'findClientRef',
      'clickOnPdf',
    ],
  })
  .catch(err => {
    console.warn(err)
  })

// Used for debug purposes only
function sleep(delay) {
  return new Promise(resolve => {
    setTimeout(resolve, delay * 1000)
  })
}
