import ContentScript from '../../connectorLibs/ContentScript'
import {blobToBase64} from '../../connectorLibs/utils'
import Minilog from '@cozy/minilog'
import format from 'date-fns/format'
const log = Minilog('ContentScript')
Minilog.enable('orangeCCC')

const BASE_URL = 'https://espace-client.orange.fr'
const DEFAULT_PAGE_URL = BASE_URL + '/accueil'
const DEFAULT_SOURCE_ACCOUNT_IDENTIFIER = 'orange'

let recentBills = []
let oldBills = []
let recentPromisesToConvertBlobToBase64 = []
let oldPromisesToConvertBlobToBase64 = []
let recentXhrUrls = []
let oldXhrUrls = []
let numberOfClick = 0
let userInfos = []

// The override here is needed to intercept XHR requests made during the navigation
// The website respond with an XHR containing a blob when asking for a pdf, so we need to get it and encode it into base64 before giving it to the pilot.
var proxied = window.XMLHttpRequest.prototype.open
// Overriding the open() method
window.XMLHttpRequest.prototype.open = function () {
  // Intercepting response for recent bills information.
  if (arguments[1].includes('/users/current/contracts')) {
    var originalResponse = this

    originalResponse.addEventListener('readystatechange', function (event) {
      if (originalResponse.readyState === 4) {
        // The response is a unique string, in order to access information parsing into JSON is needed.
        const jsonBills = JSON.parse(originalResponse.responseText)
        recentBills.push(jsonBills)
      }
    })
    return proxied.apply(this, [].slice.call(arguments))
  }
  // Intercepting response for old bills information.
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
  // Intercepting user infomations for Identity object
  if (arguments[1].includes('erb/portfoliomanager/portfolio?')) {
    var originalResponse = this

    originalResponse.addEventListener('readystatechange', function (event) {
      if (originalResponse.readyState === 4) {
        const jsonInfos = JSON.parse(originalResponse.responseText)
        userInfos.push(jsonInfos)
      }
    })
    return proxied.apply(this, [].slice.call(arguments))
  }
  // Intercepting response for recent bills blobs.
  if (arguments[1].includes('facture/v1.0/pdf?billDate')) {
    var originalResponse = this
    originalResponse.addEventListener('readystatechange', function (event) {
      if (originalResponse.readyState === 4) {
        // Pushing in an array the converted to base64 blob and pushing in another array it's href to match the indexes.
        recentPromisesToConvertBlobToBase64.push(
          blobToBase64(originalResponse.response),
        )
        recentXhrUrls.push(originalResponse.__zone_symbol__xhrURL)

        // In every case, always returning the original response untouched
        return originalResponse
      }
    })
  }
  // Intercepting response for old bills blobs.
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
  async ensureAuthenticated() {
    await this.goto(DEFAULT_PAGE_URL)
    log.debug('waiting for any authentication confirmation or login form...')

    await Promise.race([
      this.runInWorkerUntilTrue({method: 'waitForAuthenticated'}),
      this.waitForElementInWorker('[class="o-ribbon-is-connected"]'),
    ])
    this.log('After Race')
    if (await this.runInWorker('checkAuthenticated')) {
      this.log('Authenticated')
      return true
    }
    log.debug('Not authenticated')
  }

  async checkAuthenticated() {
    if (
      document.location.href.includes(
        'https://espace-client.orange.fr/accueil',
      ) &&
      document.querySelector('[class="o-ribbon-is-connected"]')
    ) {
      return true
    }
    return false
  }

  async showLoginFormAndWaitForAuthentication() {
    log.debug('waitForUserAuthentication start')
    await this.setWorkerState({visible: true, url: DEFAULT_PAGE_URL})
    await this.runInWorkerUntilTrue({method: 'waitForAuthenticated'})
    await this.setWorkerState({visible: false, url: DEFAULT_PAGE_URL})
  }
  
  async fetch(context) {
    this.log('Starting fetch')
    await this.waitForElementInWorker('a[class="ob1-link-icon ml-1 py-1"]')
    const clientRef = await this.runInWorker('findClientRef')
    console.log(clientRef)
    if (clientRef) {
      this.log('clientRef found')
      await this.clickAndWait(
        `a[href="facture-paiement/${clientRef}"]`,
        '[data-e2e="bp-tile-historic"]',
      )
      await this.clickAndWait(
        '[data-e2e="bp-tile-historic"]',
        '[aria-labelledby="bp-billsHistoryTitle"]',
      )
      const redFrame = await this.runInWorker('checkRedFrame')
      if (redFrame !== null) {
        this.log('Website did not load the bills')
        throw new Error('VENDOR_DOWN')
      }
      const moreBills = await this.runInWorker('getMoreBillsButton')
      if (moreBills) {
        const oldBillsRedFrame = await this.runInWorker('checkOldBillsRedFrame')
        if (oldBillsRedFrame !== null) {
          this.log('Website did not load the old bills')
          throw new Error('VENDOR_DOWN')
        }
        await this.clickAndWait(
          '[data-e2e="bh-more-bills"]',
          '[aria-labelledby="bp-historicBillsHistoryTitle"]',
        )
      }
    }

    await this.runInWorker('clickOnPdfs')
      this.log('pdfButtons founded and clicked')
      await this.runInWorker('processingBills')
      this.store.dataUri = []
    
    // // Putting a falsy selector allows you to stay on the wanted page for debugging purposes when DEBUG is activated.
      await this.waitForElementInWorker(
        '[pause]',
      )
  }

  findMoreBillsButton() {
    this.log('Starting findMoreBillsButton')
    const buttons = Array.from(
      document.querySelector('[data-e2e="bh-more-bills"]'),
    )
    this.log('Exiting findMoreBillsButton')
    return buttons
  }

  findPdfButtons() {
    this.log('Starting findPdfButtons')
    const buttons = Array.from(
      document.querySelectorAll('a[class="icon-pdf-file bp-downloadIcon"]'),
    )
    return buttons
  }

  async getUserDataFromWebsite() {
    const sourceAccountId = await this.runInWorker('getUserMail')
    if (sourceAccountId === 'UNKNOWN_ERROR') {
      this.log("Couldn't get a sourceAccountIdentifier, using default")
      return {sourceAccountIdentifier: DEFAULT_SOURCE_ACCOUNT_IDENTIFIER}
    }
    return {
      sourceAccountIdentifier: sourceAccountId,
    }
    
  }
  
  async getUserMail() {
    try {
      const result = document.querySelector(
        '.o-identityLayer-detail',
      ).innerHTML
      if (result) {
        return result
      }
    } catch (err) {
      if (
        err.message === "Cannot read properties of null (reading 'innerHTML')"
      ) {
        this.log(`Error message : ${err.message}, trying to reload page`)
        window.location.reload()
        this.log('Profil homePage reloaded')
      } else {
        this.log('Untreated problem encountered')
        return 'UNKNOWN_ERROR'
      }
    }
    return false
  }

  async findClientRef() {
    let parsedElem
    let clientRef
    if (document.querySelector('a[class="ob1-link-icon ml-1 py-1"]')) {
      this.log('clientRef founded')
      parsedElem = document
        .querySelectorAll('a[class="ob1-link-icon ml-1 py-1"]')[1]
        .getAttribute('href')

      const clientRefArray = parsedElem.match(/([0-9]*)/g)
      this.log(clientRefArray.length)

      for (let i = 0; i < clientRefArray.length; i++) {
        this.log('Get in clientRef loop')

        const testedIndex = clientRefArray.pop()
        if (testedIndex.length === 0) {
          this.log('No clientRef founded')
        } else {
          this.log('clientRef founded')
          clientRef = testedIndex
          break
        }
      }
      return clientRef
    }
  }

  async checkRedFrame() {
    const redFrame = document.querySelector('.alert-icon icon-error-severe')
    return redFrame
  }

  async checkOldBillsRedFrame() {
    const redFrame = document.querySelector(
      '.alert-container alert-container-sm alert-danger mb-0',
    )
    return redFrame
  }

  async getMoreBillsButton() {
    this.log('Getting in getMoreBillsButton')
    let moreBillsButton = this.findMoreBillsButton()
    console.log('moreBillsButton', moreBillsButton)
    return moreBillsButton
  }

  async clickOnPdfs() {
    log.debug('Get in clickOnPdfs')
    let buttons = this.findPdfButtons()
    if (buttons[0].length === 0) {
      this.log('ERROR Could not find pdf button')
      return 'VENDOR_DOWN'
    } else {
      for (const button of buttons) {
        this.log('will click one pdf')
        button.click()
        this.log('pdfButton clicked')
        numberOfClick = numberOfClick + 1
      }
    }
    while (
      recentPromisesToConvertBlobToBase64.length +
        oldPromisesToConvertBlobToBase64.length !==
      numberOfClick
    ) {
      this.log('Array of bills is not ready yet.')
      await sleep(1)
    }
    this.log('billsArray ready, processing files')
  }
}

const connector = new OrangeContentScript()
connector.init({
  additionalExposedMethodsNames: [
    'getUserMail',
    'findClientRef',
    'checkRedFrame',
    'getMoreBillsButton',
    'checkOldBillsRedFrame',
    'clickOnPdfs',
    // 'processingBills',
  ],
}).catch((err) => {
  console.warn(err)
})

// Used for debug purposes only
function sleep(delay) {
  return new Promise(resolve => {
    setTimeout(resolve, delay * 1000)
  })
}
