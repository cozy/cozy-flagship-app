import ContentScript from '../../connectorLibs/ContentScript'
import Minilog from '@cozy/minilog'
const log = Minilog('ContentScript')
Minilog.enable('totalenergiesCCC')
import {constants} from './constants'
import {interceptXHRResponse} from './XHRinterceptor'

//Intercepting XHR response for pdfs blobs
let XHRResponses = []
let XHRComplements = []
interceptXHRResponse('api.boulanger.com/sale/document/invoices', XHRResponses, XHRComplements)


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
    console.log('base64', this.store.resolvedBase64)
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
    const bills = document.querySelectorAll(constants.selectors.orders.orderArticles)
    const billsLength = bills.length
    this.log('Computing bills')
    const computedBills = await this.computeBills(billsLength)
    console.log('computeBills before association', computedBills)
    await this.processingPromises()
    // this.log('Associating XHR with bills')
    // const allBills = await this.associateXHR(computedBills)
    // await this.sendToPilot({
    //   allBills
    // })
  }
    
  async computeBills(billsLength) {
    this.log('computeBills starts')
    let allBills = []
    const bills = document.querySelectorAll(constants.selectors.orders.orderArticles)
    for(let i = 0 ; i < billsLength; i++){
      const rawVendorRef = bills[i].querySelector(constants.selectors.orders.vendorRef).innerHTML
      const rawDate = bills[i].querySelector(constants.selectors.orders.date).innerHTML
      const rawPrice = bills[i].querySelector(constants.selectors.orders.price).innerHTML
      const vendorRef = rawVendorRef.replace('N° : ', '')
      const splittedDate = rawDate.split('/')
      const day = splittedDate[0]
      const month = splittedDate[1]
      const year = splittedDate[2]
      const date = new Date(`${month}/${day}/${year}`)
      const amount = parseFloat(rawPrice.replace('€', '').replace(',', '.'))
      const currency = 'EUR'
      const downloadButton = bills[i].querySelector(constants.buttons.downloadFileButtonSelector)
      const oneBill = {
        vendorRef,
        date,
        amount,
        currency,
      }
      downloadButton.click()
      if (this.checkMultipleInvoices()){
        const linkedInvoices = await this.handleMultipleInvoices(oneBill)
        const closePage = document.querySelector(constants.buttons.closePage).shadowRoot.querySelector(constants.buttons.popinHeader).children[0]
        closePage.click()
        allBills.push.apply(allBills, linkedInvoices)
        const isStillMultiple = await this.checkMultipleInvoices()
        if(isStillMultiple){
          throw new Error('could not close multipleInvoices page')
        }
      }else{
        console.log('just one invoice, continue')
        console.log('XHR Received, continue')
        allBills.push(oneBill)
      }
      
    }
    return allBills
  }

  async processingPromises(){
    console.log(`processingBill starts`)
    let resolvedBase64 = []
    console.log('XHRResponses', XHRResponses)
    const testDepromessify = await Promise.all(XHRResponses)
    console.log('testDepromessify', testDepromessify)
    console.log('XHRResponses length', XHRResponses.length)

    console.log('XHRComplements', XHRComplements)
    for (let i = 0; i < XHRResponses.length; i++){
      console.log(`processing bill loop number ${i}`)
      resolvedBase64.push({
        uri: billsToBase64[i],
        url: XHRComplements[i]
      })
    }
    await this.sendToPilot({
      resolvedBase64
    })
  }
  
  // async associateXHR(computedBills){
  //   this.log('associateXHR starts')
  //   console.log('XHR promises', XHRResponses)
  //   console.log('computed bills at beginning of association', computedBills)
  //   const resolvedPromises = await Promise.all(XHRResponses)
  //   console.log('resolved promises', resolvedPromises)
  //   let allBills = []
  //   let subVendorRef = ''
  //   for(let i = 0; i < computedBills.length; i++) {
  //     let associatedBills = {
  //       ...computedBills[i]
  //     }
  //     for (let j = 0 ; j < resolvedPromises.length; j++) {
  //       console.log('checking loop for url match')
  //       let vendorRefMatch = computedBills[i].vendorRef.match('-')
  //       console.log(vendorRefMatch)
  //       if (vendorRefMatch){
  //         subVendorRef = computedBills[i].vendorRef.split('-')[1]
  //         console.log(subVendorRef)
  //       }
  //       if (resolvedPromises[j].url.match(`${computedBills[i].vendorRef}/sequences/${vendorRefMatch ? subVendorRef : '002'}`)){
  //         associatedBills.dataUri = resolvedPromises[j].base64
  //         console.log('associatedBills after uri given',associatedBills)
  //       }
  //     }
  //     console.log('associatedBills',associatedBills)
  //     allBills.push(associatedBills)
  //   }
  //   console.log('All bills after association', allBills)

  // }
  
  checkMultipleInvoices(){
    const isMultipleInvoices =document.querySelector(constants.buttons.downloadLinkedFilePopin)
    if(isMultipleInvoices !== null){
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
  
  async handleMultipleInvoices(bill){
    let linkedInvoices = []
    console.log('handleMultipleInvoice starts')
    const linkedFilesButtons = document.querySelectorAll(constants.buttons.downloadLinkedFileButtonSelector)
    let i = 0
    linkedFilesButtons.forEach((button) => {
      console.log(`${i} loop`)
      let computedLinkInvoice = {
        // This vendorRef is NOT arbitrary, the website uses this format for multiple bills.
        vendorRef: `${bill.vendorRef}-00${i+1}`,
        date: bill.date,
        amount: bill.amount,
        currency: bill.currency
      }
      button.click()
      linkedInvoices.push(computedLinkInvoice)
      i++
    })
    return linkedInvoices
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
  console.log(`Sleeping for ${delay} seconds`)
  return new Promise(resolve => {
    setTimeout(resolve, delay * 1000)
  })
}