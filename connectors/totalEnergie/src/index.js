import ContentScript from '../../connectorLibs/ContentScript'
import Minilog from '@cozy/minilog'
const log = Minilog('ContentScript')
Minilog.enable('totalenergiesCCC')

const baseUrl = 'https://www.totalenergies.fr/'

class TemplateContentScript extends ContentScript {
  //////////
  //PILOT //
  //////////
  async ensureAuthenticated() {
    const credentials = await this.getCredentials()
    if (credentials) {
      return true
    }
    if(!credentials){
      await this.goto(baseUrl)
      await this.waitForUserAuthentication()
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
    
  }

  async findAndSendCredentials(login, password){
    
  }
}

const connector = new TemplateContentScript()
connector.init({ additionalExposedMethodsNames: [] }).catch(err => {
  console.warn(err)
})