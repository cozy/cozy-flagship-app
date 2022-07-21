import ContentScript from '../../connectorLibs/ContentScript'
import Minilog from '@cozy/minilog'
const log = Minilog('ContentScript')
Minilog.enable()

const baseUrl = 'https://www.red-by-sfr.fr/'

class TemplateContentScript extends ContentScript {
  async ensureAuthenticated() {
    await this.goto(baseUrl)
    await this.waitForElementInWorker('[pause]')
  }

  async checkAuthenticated() {

  }

  async fetch(context) {
  }

  async getUserDataFromWebsite() {
    return {
      sourceAccountIdentifier: 'defaultTemplateSourceAccountIdentifier'
    }
  }
}

const connector = new TemplateContentScript()
connector.init({ additionalExposedMethodsNames: [] }).catch(err => {
  console.warn(err)
})
