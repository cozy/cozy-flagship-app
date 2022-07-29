import ContentScript from '../../connectorLibs/ContentScript'
import {kyScraper as ky, blobToBase64} from '../../connectorLibs/utils'
import Minilog from '@cozy/minilog'
const log = Minilog('ContentScript')
Minilog.enable('sfrCCC')

class TemplateContentScript extends ContentScript {
  //////////
  //PILOT //
  //////////
  async ensureAuthenticated() {
    const credentials = await this.getCredentials()
    if (credentials) {
      
    }
    if(!credentials){
      
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
  
  async getUserMail() {    
  }

}

const connector = new TemplateContentScript()
connector.init({ additionalExposedMethodsNames: [] }).catch(err => {
  console.warn(err)
})

