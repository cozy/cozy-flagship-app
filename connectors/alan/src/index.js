import ContentScript from '../../connectorLibs/ContentScript'
// import {kyScraper as ky, blobToBase64} from '../../connectorLibs/utils'
import Minilog from '@cozy/minilog'
const log = Minilog('ContentScript')
Minilog.enable('alanCCC')

const BASE_URL = 'https://alan.com/fr-fr'
const HOMEPAGE_URL = 'https://alan.com/app/dashboard'
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
    await this.waitForElementInWorker('[pauseGetData]')
  }

  async fetch(context) {

  }

  async authWithCredentials(){
    await this.goto(BASE_URL)
    await this.waitForElementInWorker('[pauseWithCred]')
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

  async getUserMail() {    
  }

}

const connector = new TemplateContentScript()
connector.init({ additionalExposedMethodsNames: [
  'checkAskForAppDowload',
] }).catch(err => {
  console.warn(err)
})