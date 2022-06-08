import ContentScript from '../../connectorLibs/ContentScript'
import { blobToBase64 } from '../../connectorLibs/utils'
import Minilog from '@cozy/minilog'
import { format } from 'date-fns'

const log = Minilog('ContentScript')
Minilog.enable('soshCCC')

const BASE_URL = 'https://espace-client.orange.fr'
const DEFAULT_PAGE_URL = BASE_URL + '/accueil'
const DEFAULT_SOURCE_ACCOUNT_IDENTIFIER = 'sosh'

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
  if (arguments[1].includes('/ecd_wp/portfoliomanager/portfolio?')) {
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
          blobToBase64(originalResponse.response)
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
          blobToBase64(originalResponse.response)
        )
        oldXhrUrls.push(originalResponse.__zone_symbol__xhrURL)

        return originalResponse
      }
    })
  }
  return proxied.apply(this, [].slice.call(arguments))
}

class SoshContentScript extends ContentScript {
  // ///////
  // PILOT//
  // ///////

  async ensureAuthenticated() {
    await this.goto(DEFAULT_PAGE_URL)
    log.debug('waiting for any authentication confirmation or login form...')

    await Promise.race([
      this.runInWorkerUntilTrue({ method: 'waitForAuthenticated' }),
      this.waitForElementInWorker('[data-e2e="e2e-ident-button"]')
    ])
    this.log('After Race')
    if (await this.runInWorker('checkAuthenticated')) {
      this.log('Authenticated')
      return true
    }
    log.debug('Not authenticated')

    let credentials = await this.getCredentials()
    if (credentials && credentials.email && credentials.password) {
      try {
        log.debug('Got credentials, trying autologin')
        await this.tryAutoLogin(credentials)
      } catch (err) {
        log.warn('autoLogin error' + err.message)
        await this.waitForUserAuthentication()
      }
    } else {
      log.debug('No credentials saved, waiting for user input')
      await this.waitForUserAuthentication()
    }

    // if (await this.runInWorker('checkAuthenticated')) {
    //   this.log('Authenticated')
    //   return true
    // } else {
    //   await this.waitForUserAuthentication()
    //   this.log('Not authenticated')
    //   return true
    // }
  }

  async tryAutoLogin(credentials) {
    this.log('autologin start')
    await this.goto(DEFAULT_PAGE_URL)
    await Promise.all([
      this.autoLogin(credentials),
      this.runInWorkerUntilTrue({ method: 'waitForAuthenticated' })
    ])
  }

  async autoLogin(credentials) {
    this.log('fill email field')
    const emailInputSelector =
      'p[data-testid="selected-account-login"] > strong'
    const passwordInputSelector = '#password-label'
    const loginButtonSelector = '#btnSubmit'
    await this.waitForElementInWorker(emailInputSelector)
    await this.runInWorker('fillText', emailInputSelector, credentials.email)

    this.log('wait for password field')
    this.waitForElementInWorker(passwordInputSelector)

    log.debug('fill password field')
    await this.runInWorker(
      'fillText',
      passwordInputSelector,
      credentials.password
    )
    await this.runInWorker('click', loginButtonSelector)
  }

  async waitForUserAuthentication() {
    log.debug('waitForUserAuthentication start')
    await this.setWorkerState({ visible: true, url: DEFAULT_PAGE_URL })
    await this.runInWorkerUntilTrue({ method: 'waitForAuthenticated' })
    await this.setWorkerState({ visible: false, url: DEFAULT_PAGE_URL })
  }

  async getUserDataFromWebsite() {
    const sourceAccountId = await this.runInWorker('getUserMail')
    if (sourceAccountId === 'UNKNOWN_ERROR') {
      this.log("Couldn't get a sourceAccountIdentifier, using default")
      return { sourceAccountIdentifier: DEFAULT_SOURCE_ACCOUNT_IDENTIFIER }
    }
    return {
      sourceAccountIdentifier: sourceAccountId
    }
  }

  async fetch(context) {
    log.debug('fetch start')
    await this.waitForElementInWorker('a[class="ob1-link-icon ml-1 py-1"]')
    const clientRef = await this.runInWorker('findClientRef')
    if (clientRef) {
      this.log('clientRef found')
      await this.clickAndWait(
        `a[href="facture-paiement/${clientRef}"]`,
        '[data-e2e="bp-tile-historic"]'
      )
      await this.clickAndWait(
        '[data-e2e="bp-tile-historic"]',
        '[aria-labelledby="bp-billsHistoryTitle"]'
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
          '[aria-labelledby="bp-historicBillsHistoryTitle"]'
        )
      }

      await this.runInWorker('clickOnPdfs')
      this.log('pdfButtons founded and clicked')
      await this.runInWorker('processingBills')
      this.store.dataUri = []

      for (let i = 0; i < this.store.resolvedBase64.length; i++) {
        let dateArray = this.store.resolvedBase64[i].href.match(
          /([0-9]{4})-([0-9]{2})-([0-9]{2})/g
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
          filename: await getFileName(
            this.store.allBills[index].date,
            this.store.allBills[index].amount / 100,
            this.store.allBills[index].id || this.store.allBills[index].tecId
          ),
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
              carbonCopy: true
            }
          }
        })
      }
      await this.saveIdentity({
        mailAdress: this.store.infosIdentity.mail,
        city: this.store.infosIdentity.city,
        phoneNumber: this.store.infosIdentity.phoneNumber
      })
      // Putting a falsy selector allows you to stay on the wanted page for debugging purposes when DEBUG is activated.
      // await this.waitForElementInWorker(
      //   '[pause]',
      // )
      await this.saveBills(this.store.dataUri, {
        context,
        fileIdAttributes: ['filename'],
        contentType: 'application/pdf',
        qualificationLabel: 'isp_invoice'
      })
    }
  }

  findPdfButtons() {
    this.log('Starting findPdfButtons')
    const buttons = Array.from(
      document.querySelectorAll('a[class="icon-pdf-file bp-downloadIcon"]')
    )
    return buttons
  }

  findMoreBillsButton() {
    this.log('Starting findMoreBillsButton')
    const buttons = Array.from(
      document.querySelector('[data-e2e="bh-more-bills"]')
    )
    this.log('Exiting findMoreBillsButton')
    return buttons
  }

  // ////////
  // WORKER//
  // ////////
  async checkAuthenticated() {
    // If Orange page is detected
    if (
      document.location.href.includes(
        'https://espace-client.orange.fr/page-accueil'
      ) &&
      document.querySelector('[class="is-mobile is-logged"]')
    ) {
      return true
    }
    // If Sosh page is detected
    if (
      document.location.href.includes(
        'https://espace-client.orange.fr/accueil'
      ) &&
      document.querySelector('[id="oecs__connecte-se-deconnecter"]')
    ) {
      return true
    }
    return false
  }
  async getUserMail() {
    try {
      const result = document.querySelector(
        '.oecs__zone-footer-button-mail'
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
      '.alert-container alert-container-sm alert-danger mb-0'
    )
    return redFrame
  }

  async getMoreBillsButton() {
    this.log('Getting in getMoreBillsButton')
    let moreBillsButton = this.findMoreBillsButton()
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

  async processingBills() {
    let resolvedBase64 = []
    this.log('Awaiting promises')
    const recentToBase64 = await Promise.all(
      recentPromisesToConvertBlobToBase64
    )
    const oldToBase64 = await Promise.all(oldPromisesToConvertBlobToBase64)
    this.log('Processing promises')
    const promisesToBase64 = recentToBase64.concat(oldToBase64)
    const xhrUrls = recentXhrUrls.concat(oldXhrUrls)
    for (let i = 0; i < promisesToBase64.length; i++) {
      resolvedBase64.push({
        uri: promisesToBase64[i],
        href: xhrUrls[i]
      })
    }
    const recentBillsToAdd = recentBills[0].billsHistory.billList
    const oldBillsToAdd = oldBills[0].oldBills
    let allBills = recentBillsToAdd.concat(oldBillsToAdd)
    log.debug('billsArray ready, Sending to pilot')
    const infosIdentity = {
      city: userInfos[0].contracts[0].contractInstallationArea.city,
      phoneNumber: userInfos[0].contracts[0].telco.publicNumber,
      mail: document.querySelector('.oecs__zone-footer-button-mail').innerHTML
    }
    await this.sendToPilot({
      resolvedBase64,
      allBills,
      infosIdentity
    })
  }
}

const connector = new SoshContentScript()
connector
  .init({
    additionalExposedMethodsNames: [
      'getUserMail',
      'findClientRef',
      'clickOnPdfs',
      'processingBills',
      'getMoreBillsButton',
      'checkRedFrame',
      'checkOldBillsRedFrame'
    ]
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

async function getFileName(date, amount, vendorRef) {
  const digestId = await hashVendorRef(vendorRef)
  const shortenedId = digestId.substr(0, 5)
  return `${date}_sosh_${amount}€_${shortenedId}.pdf`
}

async function hashVendorRef(vendorRef) {
  const msgUint8 = new window.TextEncoder().encode(vendorRef) // encode as (utf-8) Uint8Array
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8) // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
  return hashHex
}
