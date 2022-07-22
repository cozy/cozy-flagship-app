import ContentScript from '../../connectorLibs/ContentScript'
import Minilog from '@cozy/minilog'
const log = Minilog('ContentScript')
Minilog.enable()

const baseUrl = 'https://www.red-by-sfr.fr/'
const HOMEPAGE_URL = 'https://www.red-by-sfr.fr/mon-espace-client/?casforcetheme=espaceclientred#sfrclicid=EC_mire_Me-Connecter'

class TemplateContentScript extends ContentScript {
  //////////
  //PILOT //
  //////////
  async ensureAuthenticated() {
    const credentials = await this.getCredentials()
    if (credentials) {
      await this.waitForElementInWorker('[pauseWithCred]')
    }
    if(!credentials){
      await this.goto(baseUrl)
      await this.waitForElementInWorker('a[href="//www.red-by-sfr.fr/mon-espace-client/?casforcetheme=espaceclientred#redclicid=X_Menu_EspaceClient"]')
      await this.clickAndWait('a[href="//www.red-by-sfr.fr/mon-espace-client/?casforcetheme=espaceclientred#redclicid=X_Menu_EspaceClient"]', '#username')
      await this.waitForUserAuthentication()
      await this.waitForElementInWorker('[pause]')
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
    
  }
  
  async fetch(context) {
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
    if(document.location.href === HOMEPAGE_URL && document.querySelector('a[href="https://www.sfr.fr/cas/logout?red=true&url=https://www.red-by-sfr.fr"]')){
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
}

const connector = new TemplateContentScript()
connector.init({ additionalExposedMethodsNames: [] }).catch(err => {
  console.warn(err)
})
