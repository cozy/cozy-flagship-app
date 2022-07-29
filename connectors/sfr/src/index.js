import ContentScript from '../../connectorLibs/ContentScript'
import {kyScraper as ky, blobToBase64} from '../../connectorLibs/utils'
import Minilog from '@cozy/minilog'
const log = Minilog('ContentScript')
Minilog.enable('sfrCCC')

const BASE_URL = 'https://www.sfr.fr/'
const CLIENT_SPACE_URL = 'https://www.sfr.fr/mon-espace-client'
const HOMEPAGE_URL = 'https://www.sfr.fr/mon-espace-client/#sfrclicid=EC_mire_Me-Connecter'
const PERSONAL_INFOS_URL = 'https://espace-client.sfr.fr/infospersonnelles/contrat/informations/'
const LOGOUT_URL = 'https://www.sfr.fr/cas/logout?url=https://www.sfr.fr/'


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
    await this.waitForElementInWorker(`a[href="${PERSONAL_INFOS_URL}"]`)
    await this.clickAndWait(`a[href="${PERSONAL_INFOS_URL}"]`,'#emailContact' )
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

  }

  async authWithCredentials(){
    await this.goto(CLIENT_SPACE_URL)
    // await this.waitForElementInWorker('[pause]')
    await this.waitForElementInWorker(`a[href="${LOGOUT_URL}"]`)
    // const reloginPage = await this.runInWorker('getReloginPage')
    // if(reloginPage){
    //   this.log('Login expired, new authentication is needed')
    //   await this.waitForUserAuthentication()
    //   await this.saveCredentials(this.store.userCredentials)
    //   return true
    // }
    return true
  }

  async authWithoutCredentials(){
    await this.goto(CLIENT_SPACE_URL)
    await this.waitForElementInWorker('#username')
    await this.waitForUserAuthentication()
    await this.saveCredentials(this.store.userCredentials)
    return true
  }
  
  
  //////////
  //WORKER//
  //////////
  

  async checkAuthenticated() {
    const loginField = document.querySelector('#username')
    const passwordField = document.querySelector('#password')
    if (loginField && passwordField) {
      const userCredentials = await this.findAndSendCredentials.bind(this)(loginField, passwordField)
      this.log('Sendin userCredentials to Pilot')
      this.sendToPilot({
        userCredentials
      })
    }
    if(document.location.href === HOMEPAGE_URL && document.querySelector('a[href="https://www.sfr.fr/cas/logout?url=https://www.sfr.fr/"]')){
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
  
  async getUserMail() {  
    const userMailElement = document.querySelector('#emailContact').innerHTML
    this.log(userMailElement)
    if (userMailElement) {
      return userMailElement
    }
    return 'UNKNOWN_ERROR'
  }

}

const connector = new TemplateContentScript()
connector.init({ additionalExposedMethodsNames: [
  'getUserMail',
] }).catch(err => {
  console.warn(err)
})

