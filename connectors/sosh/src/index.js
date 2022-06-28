import ContentScript from '../../connectorLibs/ContentScript'
import { blobToBase64 } from '../../connectorLibs/utils'
import Minilog from '@cozy/minilog'
import { format } from 'date-fns'

const log = Minilog('ContentScript')
Minilog.enable('soshCCC')

// const BASE_URL = 'https://espace-client.orange.fr'
const BASE_URL = 'https://www.sosh.fr'
const DEFAULT_PAGE_URL = BASE_URL + '/client'
// const LOGIN_URL = ' https://login.orange.fr/?service=sosh&propagation=true&domain=sosh&force_authent=true&return_url=https%3A%2F%2Fwww.sosh.fr%2Fclient#/password'
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
    await this.waitForElementInWorker('#oecs__aide-contact')
    const credentials = await this.getCredentials()
    if (credentials){
      const helloMessage = await this.runInWorker('getHelloMessage')
      this.log(helloMessage)
      if(helloMessage){
        // await this.waitForElementInWorker(
        //   '[pause_connected]',
        // )
        return true
      }
      this.log('found credentials, processing')
      await this.waitForElementInWorker('p[data-testid="selected-account-login"]')
      
      const testEmail = await this.runInWorker('getTestEmail')
      
      
      if (credentials.email === testEmail ){
        const stayLogButton = await this.runInWorker('getStayLoggedButton')
        if ( stayLogButton != null) {
          stayLogButton.click()
          await this.waitForElementInWorker('#oecs__connecte')
          return true
        }
        log.debug('found credentials, trying to autoLog')
        // Putting a falsy selector allows you to stay on the wanted page for debugging purposes when DEBUG is activated.
        // await this.waitForElementInWorker(
        //  '[pause_half_connection]',
        // )
        await this.tryAutoLogin(credentials, 'half')
        return true
      }
      
      if (credentials.email != testEmail){
        log.debug('getting in different testEmail conditions')
        // await this.waitForElementInWorker(
        //   '[pause_diff_mail]',
        //  )
        await this.clickAndWait('#changeAccountLink','#undefined-label')
        await this.clickAndWait('#undefined-label','#login')
        await this.tryAutoLogin(credentials, 'full')
        return true
      }
    }
    if (!credentials){
      log.debug('no credentials found, use normal user login')
      // Putting a falsy selector allows you to stay on the wanted page for debugging purposes when DEBUG is activated.
      // await this.waitForElementInWorker(
      //  '[pause_no_credentials]',
      // )
      await this.clickAndWait('#changeAccountLink','#undefined-label')
      await this.clickAndWait('#undefined-label','#login')
      await this.waitForUserAuthentication()
      return true
    }

    await this.waitForElementInWorker(
      '[pause__failed_connected]',
    )
    
    log.debug('Not authenticated')
    throw new Error('LOGIN_FAILED')
  }

  async tryAutoLogin(credentials, type) {
    this.log('Trying autologin')
    await this.goto(DEFAULT_PAGE_URL)
    await this.autoLogin(credentials, type)
  }

  async autoLogin(credentials, type) {
    this.log('Autologin start')
    const emailSelector = '#login'
    const passwordInputSelector = '#password'
    const loginButton = '#btnSubmit'
    if (type === 'half'){
      this.log('wait for password field')
      await this.waitForElementInWorker(passwordInputSelector)
      await this.runInWorker('fillingForm', credentials)

      await this.runInWorker('click', loginButton)
      await this.waitForElementInWorker('#oecs__connecte')
      return true
    }
    await this.waitForElementInWorker(emailSelector)
    await this.runInWorker('fillingForm', credentials)
    await this.runInWorker('click', loginButton)
    this.log('wait for password field')
    await this.waitForElementInWorker(passwordInputSelector)
    await this.runInWorker('fillingForm', credentials)
    await this.runInWorker('click', loginButton)
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
    if(this.store != undefined){
      await this.saveCredentials(this.store.userCredentials)
    }
    await this.waitForElementInWorker('a[class="o-link-arrow text-primary pt-0"]')
    const clientRef = await this.runInWorker('findClientRef')
    if (clientRef) {
      this.log('clientRef found')
      await this.clickAndWait(
        `a[href="https://espace-client.orange.fr/facture-paiement/${clientRef}"]`,
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
        let recentPdfNumber = await this.runInWorker('getPdfNumber')
        await this.clickAndWait(
            '[data-e2e="bh-more-bills"]',
            '[aria-labelledby="bp-historicBillsHistoryTitle"]',
        )
        let allPdfNumber = await this.runInWorker('getPdfNumber')
        let oldPdfNumber = allPdfNumber - recentPdfNumber
        for (let i = 0; i < recentPdfNumber; i++){
          await this.runInWorker('waitForRecentPdfClicked', i)
          await this.clickAndWait(
            'a[class="o-link"]',
            '[data-e2e="bp-tile-historic"]',
          )
          await this.clickAndWait(
          '[data-e2e="bp-tile-historic"]',
          '[aria-labelledby="bp-billsHistoryTitle"]',
          )
          await this.clickAndWait(
            '[data-e2e="bh-more-bills"]',
            '[aria-labelledby="bp-historicBillsHistoryTitle"]',
          )
        }
        this.log('recentPdf loop ended')
        for (let i = 0; i < oldPdfNumber; i++){
          await this.runInWorker('waitForOldPdfClicked', i)
          await this.clickAndWait(
            'a[class="o-link"]',
            '[data-e2e="bp-tile-historic"]',
          )
          await this.clickAndWait(
          '[data-e2e="bp-tile-historic"]',
          '[aria-labelledby="bp-billsHistoryTitle"]',
          )
          await this.clickAndWait(
            '[data-e2e="bh-more-bills"]',
            '[aria-labelledby="bp-historicBillsHistoryTitle"]',
          )
        }
        this.log('oldPdf loop ended')
        this.log('pdfButtons all clicked')
        await this.runInWorker('processingBills')
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
            filename: await getFileName(
              this.store.allBills[index].date,
              this.store.allBills[index].amount / 100,
              this.store.allBills[index].id || this.store.allBills[index].tecId,
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
                carbonCopy: true,
              },
            },
          })
        }
        await this.saveIdentity({
          mailAdress: this.store.infosIdentity.mail,
          city: this.store.infosIdentity.city,
          phoneNumber: this.store.infosIdentity.phoneNumber,
        })
        await this.saveBills(this.store.dataUri, {
          context,
          fileIdAttributes: ['filename'],
          contentType: 'application/pdf',
          qualificationLabel: 'isp_invoice',
        })
    }
  }

  findMoreBillsButton() {
    this.log('Starting findMoreBillsButton')
    const button = Array.from(document.querySelector('[data-e2e="bh-more-bills"]'))
    this.log('Exiting findMoreBillsButton')
    return button
  }

  findPdfButtons() {
    this.log('Starting findPdfButtons')
    const buttons = Array.from(
      document.querySelectorAll('a[class="icon-pdf-file bp-downloadIcon"]'),
    )
    return buttons
  }

  findBillsHistoricButton() {
    this.log('Starting findPdfButtons')
    const button = document.querySelector('[data-e2e="bp-tile-historic"]')
    return button
  }

  findPdfNumber(){
    this.log('Starting findPdfNumber')
    const buttons = Array.from(
      document.querySelectorAll('a[class="icon-pdf-file bp-downloadIcon"]'),
    )
    return buttons.length
  }

  findStayLoggedButton(){
    this.log('Starting findStayLoggedButton')
    const button = document.querySelector('[data-oevent-label="bouton_rester_identifie"]')
    return button
  }

  findHelloMessage(){
    this.log('Starting findStayLoggedButton')
    const messageSpan = document.querySelector('span[class="d-block text-center"]')
    return messageSpan
  }

  // ////////
  // WORKER//
  // ////////

  async findAndSendCredentials(loginField) {
    this.log('getting in findAndSendCredentials')
    let userLogin = loginField.innerHTML.replace('<strong>', '').replace('</strong>', '')
    let divPassword = document.querySelector('#password').value
    const userCredentials = {
      email: userLogin,
      password:divPassword,
    }
      
    return userCredentials

  }

  waitForRecentPdfClicked(i){
    let recentPdfs = document.querySelectorAll('[aria-labelledby="bp-billsHistoryTitle"] a[class="icon-pdf-file bp-downloadIcon"]')
    recentPdfs[i].click()
  }

  waitForOldPdfClicked(i){
    let oldPdfs = document.querySelectorAll('[aria-labelledby="bp-historicBillsHistoryTitle"] a[class="icon-pdf-file bp-downloadIcon"]')
    oldPdfs[i].click()
  }

  async fillingForm(credentials) {
    if(document.querySelector('#login')){
      this.log('filling email field')
      document.querySelector('#login').value = credentials.email
      return
    }
    if (document.querySelector('#password')){
      this.log('filling password field')
      document.querySelector('#password').value = credentials.password
      return
    }
  }

  async checkAuthenticated() {
    const loginField = document.querySelector('p[data-testid="selected-account-login"]')
    const passwordField = document.querySelector('#password')
    if (loginField && passwordField) {
       const userCredentials = await this.findAndSendCredentials.bind(this)(loginField)
       this.log('Sending user credentials to Pilot')
       this.sendToPilot({
         userCredentials
        })
      }
      if (
        document.location.href.includes(
          DEFAULT_PAGE_URL
      ) &&
      document.querySelector('#oecs__connecte')
    ) {
      this.log('Check Authenticated succeeded')
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

  async getHelloMessage(){
    this.log('Starting findHelloMessage')
    const messageSpan = this.findHelloMessage()
    return messageSpan
  }

  async findClientRef() {
    let parsedElem
    let clientRef
    if (document.querySelector('a[class="o-link-arrow text-primary pt-0"]')) {
      this.log('clientRef founded')
      parsedElem = document
      .querySelector('a[class="o-link-arrow text-primary pt-0"]')
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

  async getStayLoggedButton(){
    this.log('Starting getStayLoggedButton')
    const button = this.findStayLoggedButton()
    return button
  }

  async getTestEmail() {
    this.log('Getting in getTestEmail')
    const result = document.querySelector(
      'p[data-testid="selected-account-login"]',
    ).innerHTML.replace('<strong>', '').replace('</strong>', '')
    if (result) {
      return result
    }
    return null
  }

  async getMoreBillsButton() {
    this.log('Getting in getMoreBillsButton')
    let moreBillsButton = this.findMoreBillsButton()
    return moreBillsButton
  }

  async getPdfNumber() {
    this.log('Getting in getPdfNumber')
    let pdfNumber = this.findPdfNumber()
    return pdfNumber
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
      'processingBills',
      'getMoreBillsButton',
      'checkRedFrame',
      'checkOldBillsRedFrame',
      'getTestEmail',
      'fillingForm',
      'getStayLoggedButton',
      'getHelloMessage',
      'getPdfNumber',
      'waitForRecentPdfClicked',
      'waitForOldPdfClicked',
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
