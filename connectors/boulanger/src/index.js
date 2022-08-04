import ContentScript from '../../connectorLibs/ContentScript'
import Minilog from '@cozy/minilog'
const log = Minilog('ContentScript')
Minilog.enable('totalenergiesCCC')
import {constants} from './constants'
import {interceptXHRResponse} from './XHRinterceptor'

//Intercepting XHR response for pdfs blobs
let XHRResponses = []
interceptXHRResponse('api.boulanger.com/sale/document/invoices', XHRResponses)

class TemplateContentScript extends ContentScript {
  //////////
  //PILOT //
  //////////
  async ensureAuthenticated() {
    const credentials = await this.getCredentials()
    if (credentials) {
      const auth = await this.authWithCredentials(credentials)
      return true
    }
    if(!credentials){
      const auth = await this.authWithoutCredentials()
     return true
    }
  }

  async waitForUserAuthentication() {
    this.log('waitForUserAuthentication starts')
    await this.setWorkerState({visible: true})
    await this.runInWorkerUntilTrue({method: 'waitForAuthenticated'})
    await this.setWorkerState({visible: false})
  }

  
  async getUserDataFromWebsite() {
    await this.waitForElementInWorker(constants.selectors.accountInfosSelector)
    await this.runInWorker('click', constants.selectors.accountInfosSelector)
    await this.waitForElementInWorker('.button--primary')
    // await this.waitForElementInWorker(constants.selectors.personnalInformations.email)
    const sourceAccountId = await this.runInWorker('getUserIdentity')
    if (sourceAccountId === 'UNKNOWN_ERROR') {
      this.log("Couldn't get a sourceAccountIdentifier, using default")
      return { sourceAccountIdentifier: constants.DEFAULT_SOURCE_ACCOUNT_IDENTIFIER }
    }
    return {
      sourceAccountIdentifier: sourceAccountId
    }
    
  }
  
  async fetch(context) {
    await this.runInWorker('click', constants.buttons.backPanelButtonSelector)
    await this.waitForElementInWorker(constants.selectors.myOrderPageSelector)
    await this.clickAndWait(constants.selectors.myOrderPageSelector, constants.selectors.orders.yearList)
    await this.runInWorker('getBills')
    await this.waitForElementInWorker('[pause]')
  }

  async authWithCredentials(credentials){
    await this.goto(constants.urls.baseUrl)
    await this.waitForElementInWorker(constants.selectors.accountButtonSelector)
    await this.runInWorker('click', constants.selectors.accountButtonSelector)
    const alreadyLogged = await this.runInWorker('checkLoginState')
    if (alreadyLogged){
      return true
    }
    // await this.goto(baseUrl)
    // await this.waitForElementInWorker(accountButtonSelector)
    // await this.clickAndWait(accountButtonSelector, loginInputSelector)
    // const autoLoginSuccess = await this.tryAutoLogin(credentials)
    // if(autoLoginSuccess){
      // }
      // await this.waitForElementInWorker('[pauseNoSuccess]')
      
    }
    
  async authWithoutCredentials(){
    await this.goto(constants.urls.baseUrl)
    await this.waitForElementInWorker(constants.selectors.accountButtonSelector)
    await this.clickAndWait(constants.selectors.accountButtonSelector, constants.selectors.loginInputSelector)
    await this.waitForUserAuthentication()
    await this.saveCredentials(this.store.userCredentials)
    return true
  }

  async tryAutoLogin(credentials) {
    this.log('Trying autologin')
    const autoLoginSuccess = await this.autoLogin(credentials)
    return autoLoginSuccess
  }

  async autoLogin(credentials) {
    this.log('Autologin start')
    await this.waitForElementInWorker(constants.selectors.loginInputSelector)
    await this.runInWorker('click', rememberMeButton)
    const isFilled = await this.runInWorker('fillingForm', credentials)
    if (isFilled) {
      console.log('sleep for 5 sec')
      await sleep(5)
      await this.runInWorker('click', loginButtonSelector)
      return true
    }
    return false
  }
  
  //////////
  //WORKER//
  //////////
  
  async checkAuthenticated() {
    const loginField = document.querySelector(constants.selectors.loginInputSelector)
    const passwordField = document.querySelector(constants.selectors.passwordInputSelector)
    if (loginField && passwordField) {
      const userCredentials = await this.findAndSendCredentials.bind(this)(loginField, passwordField)
      this.log('Sendin userCredentials to Pilot')
      this.sendToPilot({
        userCredentials
      })
    }
    if(document.querySelector(constants.selectors.helloMessageSelector) && document.querySelector(constants.buttons.logoutButtonSelector)){
      this.log('Auth Check succeeded')
      return true
    }
    return false
  }

  async findAndSendCredentials(login, password){
    this.log('findAndSendCredentials starts')
    let userLogin = login.value
    let userPassword = password.value
    const userCredentials = {
      login : userLogin,
      password : userPassword
    }
    return userCredentials
  }

  async checkLoginState(){
    const helloMessage = document.querySelector(constants.selectors.helloMessageSelector)
    const logoutButton = document.querySelector(constants.buttons.logoutButtonSelector)
    if(helloMessage && logoutButton){
      return true
    }
    return false
  }

  async fillingForm(credentials) {
    const loginInput = document.querySelector(constants.selectors.loginInputSelector)
    const passwordInput = document.querySelector(constants.selectors.passwordInputSelector)
    if (loginInput && passwordInput){
      loginInput.click()
      this.log('filling login and password fields')
      await this.fillText(constants.selectors.loginInputSelector, credentials.login)
      console.log('sleep for 5 sec')
      await sleep(5)
      passwordInput.click()
      await this.fillText(constants.selectors.passwordInputSelector, credentials.password)
      console.log('sleep for 5 sec')
      await sleep(5)
      return true
    }
    return false
  }

  async getUserIdentity(){
    const familyName = document.querySelector(constants.selectors.personnalInformations.familyName)
    const givenName = document.querySelector(constants.selectors.personnalInformations.givenName)
    const city = document.querySelector(constants.selectors.personnalInformations.city)
    const country = document.querySelector(constants.selectors.personnalInformations.country)
    const postalCode = document.querySelector(constants.selectors.personnalInformations.postalCode)
    const address = document.querySelector(constants.selectors.personnalInformations.address)
    const email = document.querySelector(constants.selectors.personnalInformations.email)
    const phoneNumber = document.querySelector(constants.selectors.personnalInformations.phoneNumber)
    let userIdentity = {
      name: {
        familyName: familyName.value,
        givenName: givenName.value,
        fullName: `${givenName.value} ${familyName.value}`
      },
      address: {
        formattedAddress: `${address.value} ${postalCode.value} ${city.value} ${country.value}`,
        city: city.value,
        country: country.value,
        postalCode: postalCode.value,
        address: address.value,
      },
      phone: [
        {
          type: 'mobile',
          number: phoneNumber.value
        }
      ],
      email: email.value,
    }
    const addressComplement = document.querySelector(constants.selectors.personnalInformations.addressComplement).value
    if(addressComplement !== ''){
      userIdentity.addressComplement = addressComplement
    }
    await this.sendToPilot({userIdentity})
    return userIdentity.email
  }

  
  async getBills(){
    let allBills = []
    const bills = document.querySelectorAll(constants.selectors.orders.orderArticles)
    console.log(bills)
    bills.forEach(async (bill) => {
      const rawVendorRef = bill.querySelector('h3[class="product-global-info__id"]').innerHTML
      const rawDate = bill.querySelector('p[class="product-global-info__date"] > span').innerHTML
      const rawPrice = bill.querySelector('p[class="product-global-info__price"] > span').innerHTML
      const vendorRef = rawVendorRef.replace('N° : ', '')
      const splittedDate = rawDate.split('/')
      const day = splittedDate[0]
      const month = splittedDate[1]
      const year = splittedDate[2]
      const date = new Date(`${month}/${day}/${year}`)
      const amount = parseFloat(rawPrice.replace('€', '').replace(',', '.'))
      const currency = 'EUR'
      const downloadButton = bill.querySelector(constants.buttons.downloadFileButtonSelector)
      const oneBill = {
        vendorRef,
        date,
        amount,
        currency,
      }
      const XHRLength = XHRResponses.length
      downloadButton.click()
      const multipleInvoices = this.checkMultipleInvoices()
      // if (multipleInvoices){
      //   console.log('MultipleInvoice condition')
      //   const linkedFilesButtons = document.querySelectorAll(constants.buttons.downloadLinkedFileButtonSelector)
      //   const closePage = document.querySelector(constants.buttons.closePage)
      //   for (let i = 0; i < linkedFilesButtons.length; i++) {
      //     console.log('forLoop of multipleInvoices')
      //     const XHRLength = XHRResponses.length
      //     linkedFilesButtons[i].click()
      //     await sleep(5)
      //     // while(this.checkXHRReception(XHRLength)!== true){
      //     //   this.log('Waiting for XHR reception')
      //     //   await sleep(1)
      //     // }
      //     console.log('XHR Received, continue')
      //     let linkedInvoice = {
      //       vendorRef: `${oneBill.vendorRef}-00${i+1}`,
      //       date: oneBill.date,
      //       amount: oneBill.amount,
      //       currency: oneBill.currency
      //     }
      //     console.log('Pushing linkedInvoice')
      //     allBills.push(linkedInvoice)
      //   }
      //   console.log('Supposed to close the multipleInvoices page')
      //   closePage.click()
      // }else {
        console.log('just one invoice, continue')
       console.log('XHR Received, continue')
       allBills.push(oneBill)
      // }
      console.log('allBills', allBills)
    })
  }
  
  checkMultipleInvoices(){
    const multipleInvoices =document.querySelector(constants.buttons.downloadLinkedFileButtonSelector)
    if(multipleInvoices !== null){
      return true
    }
    return false
  }

  async checkXHRReception(XHRLength){
    const XHRLengthAfterClick = XHRResponses.length
    if (XHRLengthAfterClick <= XHRLength ){
      return false
    }
    return true
  }
  
}

const connector = new TemplateContentScript()
connector.init({ additionalExposedMethodsNames: [
  'fillingForm',
  'checkLoginState',
  'getUserIdentity',
  'getBills',
] }).catch(err => {
  console.warn(err)
})

// Used for debug purposes only
function sleep(delay) {
  return new Promise(resolve => {
    setTimeout(resolve, delay * 1000)
  })
}