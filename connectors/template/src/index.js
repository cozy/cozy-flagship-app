import ContentScript from '../../connectorLibs/ContentScript'
import Minilog from '@cozy/minilog'

const log = Minilog('ContentScript')
Minilog.enable()

const baseUrl = 'http://toscrape.com'
const defaultSelector = "a[href='http://quotes.toscrape.com']"
const loginLinkSelector = `[href='/login']`
const logoutLinkSelector = `[href='/logout']`

class TemplateContentScript extends ContentScript {
  async ensureAuthenticated() {
    // console.log('ENSURE AUTHENTICATED')
    return true
    // await this.goto(baseUrl)
    // await this.waitForElementInWorker(defaultSelector)
    // await this.runInWorker('click', defaultSelector)
    // // wait for both logout or login link to be sure to check authentication when ready
    // await Promise.race([
    //   this.waitForElementInWorker(loginLinkSelector),
    //   this.waitForElementInWorker(logoutLinkSelector)
    // ])
    // const authenticated = await this.runInWorker('checkAuthenticated')
    // if (!authenticated) {
    //   this.log('not authenticated')
    //   await this.showLoginFormAndWaitForAuthentication()
    // }
    // return true
  }

  async checkAuthenticated() {
    return Boolean(document.querySelector(logoutLinkSelector))
  }

  async showLoginFormAndWaitForAuthentication() {
    log.debug('showLoginFormAndWaitForAuthentication start')
    await this.clickAndWait(loginLinkSelector, '#username')
    await this.setWorkerState({ visible: true })
    await this.runInWorkerUntilTrue({ method: 'waitForAuthenticated' })
    await this.setWorkerState({ visible: false })
  }

  async fetch(context) {
    log.debug(context, 'fetch context')
    const bookLinkSelector = `[href*='books.toscrape.com']`
    await this.goto(baseUrl + '/index.html')
    await this.waitForElementInWorker(bookLinkSelector)
    await this.clickAndWait(bookLinkSelector, '#promotions')
    const bills = await this.runInWorker('parseBills')

    await this.saveFiles(bills, {
      contentType: 'image/jpeg',
      fileIdAttributes: ['filename'],
      context
    })
  }

  async getUserDataFromWebsite() {
    return {
      sourceAccountIdentifier: 'defaultTemplateSourceAccountIdentifier'
    }
  }

  async parseBills() {
    const articles = document.querySelectorAll('article')
    return Array.from(articles).map(article => ({
      amount: normalizePrice(article.querySelector('.price_color').innerHTML),
      filename: article.querySelector('h3 a').getAttribute('title'),
      fileurl:
        'https://books.toscrape.com/' +
        article.querySelector('img').getAttribute('src')
    }))
  }
}

// Convert a price string to a float
function normalizePrice(price) {
  return parseFloat(price.replace('£', '').trim())
}

const connector = new TemplateContentScript()
connector.init({ additionalExposedMethodsNames: ['parseBills'] }).catch(err => {
  console.warn(err)
})

/*********************/
/* PARTIE OBSERVABLE */
/*********************/

const doStuffConnector = (messageId) => {
  const payloadResult = JSON.stringify({
    message: 'answer___doStuffConnector',
    messageId: messageId,
    param: {
      result: true
    }
  })

  postMessage(payloadResult)
}

function postMessage (message) {
  if (window.ReactNativeWebView.postMessage === undefined) {
    setTimeout(postMessage, 200, message)
  } else {
    window.ReactNativeWebView.postMessage(message)
  }
}

function processMessage (message) {
  const payload = JSON.parse(message)

  const {
    message: functionName,
    messageId,
    param
  } = payload

  if (Object.keys(messagingFunctions).includes(functionName)) {
    messagingFunctions[functionName](messageId, param)
  } else {
    console.log('unrecognizedMessage')
  }
}

window.document.addEventListener('message', function (e) {
  processMessage(e.data)
})

const messagingFunctions = {
  doStuffConnector
}