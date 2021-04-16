import ContentScript from './libs/ContentScript'
import {kyScraper} from './libs/utils'

monkeyPatch()

class TestContentScript extends ContentScript {
  async ensureAuthenticated(val) {
    document.body.innerHTML = 'not authenticated'
    if (!(await isAuthenticated())) {
      this.log('not authenticated')
      await this.showLoginFormAndWaitForAuthentication()
    }
    document.body.innerHTML = 'Authenticated o/'
  }

  async showLoginFormAndWaitForAuthentication() {
    await this.bridge.call(
      'doLogin',
      'https://www.oui.sncf/espaceclient/accueil',
    )
    await new Promise((resolve, reject) => {
      let interval
      interval = window.setInterval(async () => {
        this.log('checking authentication')
        if (await isAuthenticated()) {
          window.clearInterval(interval)
          resolve()
        }
      }, 5000)
    })
    await this.bridge.call('doLogin', null)
  }

  async getUserDataFromWebsite() {
    return {
      email: 'toto@cozycloud.cc',
    }
  }

  async fetch() {}
}

const connector = new TestContentScript()
connector.init().catch((err) => {
  console.warn(err)
})

function monkeyPatch() {
  window.open = function (url) {
    document.location = url
  }
}

async function isAuthenticated() {
  const {redirected} = await kyScraper.get(
    'https://www.oui.sncf/espaceclient/commandes-en-cours',
  )
  return !redirected
}
