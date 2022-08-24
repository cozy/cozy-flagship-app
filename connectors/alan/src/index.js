import ContentScript from '../../connectorLibs/ContentScript'
// import {kyScraper as ky, blobToBase64} from '../../connectorLibs/utils'
import Minilog from '@cozy/minilog'
const log = Minilog('ContentScript')
Minilog.enable('alanCCC')

const BASE_URL = 'https://alan.com/fr-fr'
const LOGIN_URL = 'https://alan.com/login'
const HOMEPAGE_URL = 'https://alan.com/app/dashboard'
const PERSONAL_INFOS_URL = 'https://alan.com/app/dashboard#individualProfile/home'
class TemplateContentScript extends ContentScript {
  //////////
  //PILOT //
  //////////
  async ensureAuthenticated() {
    // We need to force Desktop version of the website, otherwise some pages won't be accessible on mobile
    await this.bridge.call(
      'setUserAgent',
      'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:94.0) Gecko/20100101 Firefox/94.0',
    )
    const credentials = await this.getCredentials()
    if (credentials) {
      const auth = await this.authWithCredentials()
      if(auth) {
        return true
      }
      return false
    }
    if(!credentials){
      const auth = await this.authWithoutCredentials()
      if(auth) {
        return true
      }
      return false
    }
  }

  async waitForUserAuthentication() {
    this.log('waitForUserAuthentication starts')
    await this.setWorkerState({visible: true})
    await this.runInWorkerUntilTrue({method: 'waitForAuthenticated'})
    await this.setWorkerState({visible: false})
  }


  async getUserDataFromWebsite() {
    await this.goto(PERSONAL_INFOS_URL)
    await this.waitForElementInWorker('.email-wrapper')
    const sourceAccountId = await this.runInWorker('getUserMail')
    await this.waitForElementInWorker('.address-wrapper')
    await this.runInWorker('getUserIdentity')
    if (sourceAccountId === 'UNKNOWN_ERROR') {
      this.log("Couldn't get a sourceAccountIdentifier, using default")
      return { sourceAccountIdentifier: DEFAULT_SOURCE_ACCOUNT_IDENTIFIER }
    }
    return {
      sourceAccountIdentifier: sourceAccountId
    }
  }
  
  async fetch(context) {
    await this.clickAndWait('#individualProfile-invoices', '.coverage-wrapper')
    await this.waitForElementInWorker('[pause]')

  }

  async authWithCredentials(){
    await this.goto(LOGIN_URL)
    await this.waitForElementInWorker('.HelpButton')
    const isLogged = await this.runInWorker('checkIfLogged')
    if(isLogged){
      return true
    }
    await this.waitForElementInWorker('[pauseWithCred]')
    await this.clickAndWait('a[href="/login"]', 'input[name="password"]' )
  }

  async authWithoutCredentials(){
    await this.goto(BASE_URL)
    await this.waitForElementInWorker('a[href="/login"]')
    await this.clickAndWait('a[href="/login"]', 'input[name="password"]' )
    await this.waitForUserAuthentication()
    await this.saveCredentials(this.store.userCredentials)
    const isAskingForDownload = await this.runInWorker('checkAskForAppDowload')
    if(isAskingForDownload){
      await this.clickAndWait('a[href="#"]','div[class="murray__NavList"]')
    }
    return true
  }


  //////////
  //WORKER//
  //////////


  async checkAuthenticated() {
    const loginField = document.querySelector('input[name="email"]')
    const passwordField = document.querySelector('input[name="password"]')
    if (loginField && passwordField) {
      const userCredentials = await this.findAndSendCredentials.bind(this)(loginField, passwordField)
      this.log('Sendin userCredentials to Pilot')
      this.sendToPilot({
        userCredentials
      })
    }
    if(document.location.href.includes(`${HOMEPAGE_URL}`) && document.querySelector('a[href="#"]') || document.querySelector('div[class="murray__NavList"]')){
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

  checkAskForAppDowload() {
    if(document.querySelector('a[href="#"]')){
      return true
    }else{
      return false
    }
  }

  checkIfLogged(){
    if(document.location.href === HOMEPAGE_URL){
      return true
    }else{
      return false
    }
  }

  getUserMail() { 
    const userInfosElements = document.querySelectorAll('.value-box-value')
    const userMail = userInfosElements[3].innerHTML
    if (userMail) {
      return userMail
    }
    return 'UNKNOWN_ERROR'
  }

  async getUserIdentity(){
    const nameElement = document.querySelector('h4').innerHTML.split('&nbsp;')
    const nameString = nameElement[0]
    console.log(nameElement)
    const givenName = nameString.split(' ')[0]
    const familyName = nameString.split(' ')[1]
    const userInfosElements = document.querySelectorAll('.value-box-value')
    const birthDate = userInfosElements[0].textContent.split('M')[0]
    const socialSecurityNumber = userInfosElements[1].children[0].children[1].children[0].textContent
    const email = userInfosElements[3].innerHTML
    const address = userInfosElements[5].innerHTML.split(', ')
    const street = address[0]
    const postCode = address[1]
    const city = address[2]
    const userIdentity = {
      email,
      birthDate,
      socialSecurityNumber,
      name : {
        givenName,
        familyName,
        fullname : `${givenName} ${familyName}`
      },
      address: [
        {
          formattedAddress : `${street} ${postCode} ${city}`,
          postCode,
          city,
          street
        }
      ]
    }
    await this.sendToPilot({userIdentity})
  }

}

const connector = new TemplateContentScript()
connector.init({ additionalExposedMethodsNames: [
  'checkAskForAppDowload',
  'checkIfLogged',
  'getUserMail',
  'getUserIdentity',
] }).catch(err => {
  console.warn(err)
})