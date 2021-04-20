import ContentScript from './libs/ContentScript'
import {kyScraper} from './libs/utils'

monkeyPatch()

class TestContentScript extends ContentScript {
  async ensureAuthenticated(val) {
    setTimeout(() => (document.body.innerHTML = 'not authenticated'), 1000)
    if (!(await isAuthenticated())) {
      this.log('not authenticated')
      await this.showLoginFormAndWaitForAuthentication()
    }
    setTimeout(() => (document.body.innerHTML = 'Authenticated o/'), 1000)
  }

  async showLoginFormAndWaitForAuthentication() {
    await this.bridge.call('setWorkerState', {
      url: 'https://www.oui.sncf/espaceclient/accueil',
      visible: true,
    })
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
