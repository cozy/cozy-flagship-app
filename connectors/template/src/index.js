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
    await this.goto(baseUrl)
    await this.waitForElementInWorker(defaultSelector)
    await this.runInWorker('click', defaultSelector)
    // wait for both logout or login link to be sure to check authentication when ready
    await Promise.race([
      this.waitForElementInWorker(loginLinkSelector),
      this.waitForElementInWorker(logoutLinkSelector)
    ])
    const authenticated = await this.runInWorker('checkAuthenticated')
    if (!authenticated) {
      this.log('not authenticated')
      await this.showLoginFormAndWaitForAuthentication()
    }
    return true
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
