import ContentScript from './libs/ContentScript'
import {kyScraper} from './libs/utils'
import Minilog from '@cozy/minilog'

const log = Minilog('ContentScript')
window.Minilog = Minilog

monkeyPatch()
class SncfContentScript extends ContentScript {
  async ensureAuthenticated() {
    log.debug('ensureAuthenticated start')
    setTimeout(() => (document.body.innerHTML = 'not authenticated'), 1000)
    if (!(await this.checkAuthenticated())) {
      this.log('not authenticated')
      await this.showLoginFormAndWaitForAuthentication()
    }
    setTimeout(() => (document.body.innerHTML = 'Authenticated o/'), 1000)
  }

  /**
   * Display the login form in the worker webview and wait for worker event to continue execution
   */
  async showLoginFormAndWaitForAuthentication() {
    log.debug('showLoginFormAndWaitForAuthentication start')
    await this.bridge.call('setWorkerState', {
      url: 'https://www.oui.sncf/espaceclient/identification',
      visible: true,
    })
    await this.runInWorkerUntilTrue('checkAuthenticated')
    await this.bridge.call('setWorkerState', {
      visible: false,
    })
  }

  async checkAuthenticated() {
    const {redirected} = await kyScraper.get(
      'https://www.oui.sncf/espaceclient/commandes-en-cours',
    )
    return !redirected
  }

  async getUserDataFromWebsite() {
    return {
      email: 'toto@cozycloud.cc',
    }
  }

  async fetch() {}
}

const connector = new SncfContentScript()
connector.init().catch((err) => {
  console.warn(err)
})

function monkeyPatch() {
  window.open = function (url) {
    document.location = url
  }
}
