import ContentScript from '../../connectorLibs/ContentScript'
import {kyScraper as ky} from '../../connectorLibs/utils'
import Minilog from '@cozy/minilog'
import format from 'date-fns/format'
const log = Minilog('ContentScript')
Minilog.enable('orangeCCC')

const baseUrl = 'https://espace-client.orange.fr'

class OrangeContentScript extends ContentScript {
  async ensureAuthenticated() {
    
  }

  async checkAuthenticated() {
    
  }

  async showLoginFormAndWaitForAuthentication() {
    
  }

  async fetch(context) {
    
  }

  async getUserDataFromWebsite() {
    
  }
}

const connector = new OrangeContentScript()
connector.init().catch((err) => {
  console.warn(err)
})
