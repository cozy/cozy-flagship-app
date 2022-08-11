import ContentScript from '../../connectorLibs/ContentScript'
import Minilog from '@cozy/minilog'
const log = Minilog('ContentScript')
Minilog.enable('totalenergiesCCC')

const baseUrl = 'https://www.totalenergies.fr/'
const MAINTENANCE_URL = 'https://maintenance.direct-energie.com'
const HOMEPAGE_URL = 'https://www.totalenergies.fr/clients/accueil#fz-authentificationForm'

class TemplateContentScript extends ContentScript {
  //////////
  //PILOT //
  //////////
  async ensureAuthenticated() {
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
    await this.clickAndWait('a[href="/clients/mon-compte"]', 'a[href="/clients/mon-compte/mes-infos-de-contact"]')
    await this.clickAndWait('a[href="/clients/mon-compte/mes-infos-de-contact"]', 'div[class="pb-dm"]')
    const sourceAccountId = await this.runInWorker('getUserMail')
    if(sourceAccountId === 'UNKNOWN_ERROR'){
      this.log("Couldn't find a sourceAccountIdentifier, using default")
      return {sourceAccountIdentifier: DEFAULT_SOURCE_ACCOUNT_IDENTIFIER}
    }
    return {sourceAccountIdentifier: sourceAccountId}
  }
  
  async fetch(context) {
    // await this.waitForElementInWorker('[pause]')
  }

  async authWithCredentials(){
    await this.goto(baseUrl)
    await this.waitForElementInWorker('a[class="menu-p-btn-ec"]')
    await this.runInWorker('clickLoginPage')
    if (await this.checkAuthenticated()){
      return true
    }
  }

  async authWithoutCredentials(){
    await this.goto(baseUrl)
    await this.waitForElementInWorker('a[class="menu-p-btn-ec"]')
    await this.runInWorker('clickLoginPage')
    const maintenanceStatus = await this.runInWorker('checkMaintenanceStatus')
    if (maintenanceStatus){
      throw new Error('VENDOR_DOWN')
    }
    await this.waitForElementInWorker('#formz-authentification-form-password')
    await this.waitForUserAuthentication()
    await this.saveCredentials(this.store.userCredentials)
    return true
  }
  
  //////////
  //WORKER//
  //////////
  
  async checkAuthenticated() {
    const loginField = document.querySelector('#formz-authentification-form-login')
    const passwordField = document.querySelector('#formz-authentification-form-password')
    if (loginField && passwordField) {
      const userCredentials = await this.findAndSendCredentials.bind(this)(loginField, passwordField)
      this.log('Sendin userCredentials to Pilot')
      this.sendToPilot({
        userCredentials
      })
    }
    if(document.location.href === HOMEPAGE_URL && document.querySelector('.menu-btn--deconnexion')){
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

  async clickLoginPage(){
    const loginPageButton = this.getLoginPageButton()
    if (loginPageButton){
      loginPageButton.click()
      return true
    }
    this.log('No loginPage found')
    return false
  }

  getLoginPageButton(){
    const loginPageButton = document.querySelector('a[class="menu-p-btn-ec"]')
    return loginPageButton
  }

  async checkMaintenanceStatus(){
    const isInMaintenance = this.checkMaintenanceMessage()
    if (isInMaintenance){
      return true
    }
    return false
  }

  checkMaintenanceMessage(){
    const maintenanceMessage = document.querySelector('.big').innerHTML
    if (document.location.href === MAINTENANCE_URL && maintenanceMessage === 'Notre site est actuellement en maintenance.'){
      return true
    }else{
      return false
    }
  }

  getUserMail(){
    const userMailElement = document.querySelectorAll('div[class="pb-dm"]')
    const userMail = userMailElement[1].querySelectorAll('strong')[1].innerHTML
    if(userMail) return userMail
    return 'UNKNOWN_ERROR'
  }
}

const connector = new TemplateContentScript()
connector.init({ additionalExposedMethodsNames: [
  'clickLoginPage',
  'checkMaintenanceStatus',
  'getUserMail'
] }).catch(err => {
  console.warn(err)
})