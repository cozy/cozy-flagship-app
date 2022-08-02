import ContentScript from '../../connectorLibs/ContentScript'
import Minilog from '@cozy/minilog'
const log = Minilog('ContentScript')
Minilog.enable('totalenergiesCCC')

const baseUrl = ''


class TemplateContentScript extends ContentScript {
  //////////
  //PILOT //
  //////////
  async ensureAuthenticated() {
    const credentials = await this.getCredentials()
    if (credentials) {
      const auth = await this.authWithCredentials()
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
    
  }
  
  async fetch(context) {
  }

  async authWithCredentials(){
  
  }

  async authWithoutCredentials(){
    
  }
  
  //////////
  //WORKER//
  //////////
  
  async checkAuthenticated() {
    
  }
}

const connector = new TemplateContentScript()
connector.init({ additionalExposedMethodsNames: [] }).catch(err => {
  console.warn(err)
})