import ContentScript from './libs/ContentScript'
import {kyScraper} from './libs/utils'

monkeyPatch()
class TestContentScript extends ContentScript {
  async ensureAuthenticated() {
    setTimeout(() => (document.body.innerHTML = 'not authenticated'), 1000)
    if (!(await isAuthenticated())) {
      this.log('not authenticated')
      await this.showLoginFormAndWaitForAuthentication()
    }
    setTimeout(() => (document.body.innerHTML = 'Authenticated o/'), 1000)
  }

  /**
   * Display the login form in the worker webview and wait for worker event to continue execution
   */
  async showLoginFormAndWaitForAuthentication() {
    await this.bridge.call('setWorkerState', {
      url: 'https://www.oui.sncf/espaceclient/identification',
      visible: true,
    })
    await this.waitForWorkerEvent('authenticated')
    await this.bridge.call('setWorkerState', {
      visible: false,
    })
  }

  async getUserDataFromWebsite() {
    return {
      email: 'toto@cozycloud.cc',
    }
  }

  async fetch() {}
}

const connector = new TestContentScript()
connector
  .init()
  .then(workerSendAuthenticatedEvent)
  .catch((err) => {
    console.warn(err)
  })

function monkeyPatch() {
  window.open = function (url) {
    document.location = url
  }
}

/**
 * If authentication is detected as done, send a worker event to the pilot to indicate it.
 */
async function workerSendAuthenticatedEvent() {
  console.log('are we authenticated ?')
  if (await isAuthenticated()) {
    connector.bridge.emit('workerEvent', {name: 'authenticated'})
  }
}

/**
 * Detect authentication
 *
 * @returns {Boolean}
 */
async function isAuthenticated() {
  const {redirected} = await kyScraper.get(
    'https://www.oui.sncf/espaceclient/commandes-en-cours',
  )
  return !redirected
}
