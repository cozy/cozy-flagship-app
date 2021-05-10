import ContentScript from './libs/ContentScript'
import {kyScraper as ky} from './libs/utils'
import Minilog from '@cozy/minilog'
import format from 'date-fns/format'
const log = Minilog('ContentScript')
Minilog.enable()

const baseUrl = 'http://books.toscrape.com'

class TemplateContentScript extends ContentScript {
  async ensureAuthenticated() {
    await this.bridge.call('setWorkerState', {
      url: 'http://quotes.toscrape.com/login',
      visible: false,
    })
    const authenticated = await this.bridge.call(
      'runInWorker',
      'checkAuthenticated',
    )
    if (!authenticated) {
      this.log('not authenticated')
      await this.showLoginFormAndWaitForAuthentication()
    }
    return true
  }

  async checkAuthenticated() {
    const resp = await ky.get('http://quotes.toscrape.com/')
    const $ = await resp.$()
    const result = $(`a[href='/logout']`)
    return result.length === 1
  }

  async showLoginFormAndWaitForAuthentication() {
    log.debug('showLoginFormAndWaitForAuthentication start')
    await this.bridge.call('setWorkerState', {
      url: 'http://quotes.toscrape.com/login',
      visible: true,
    })
    await this.runInWorkerUntilTrue('checkAuthenticated')
    await this.bridge.call('setWorkerState', {
      visible: false,
    })
  }

  async fetch(context) {
    log.debug(context, 'fetch context')
    const resp = await ky.get(baseUrl + '/index.html')
    const entries = await this.parseDocuments(resp)
    await this.saveFiles(entries, {
      contentType: 'image/jpeg',
      fileIdAttributes: ['filename'],
      context,
    })
  }

  async getUserDataFromWebsite() {
    return {
      sourceAccountIdentifier: 'defaultTemplateSourceAccountIdentifier',
    }
  }

  async parseDocuments(resp) {
    const result = await resp.scrape(
      {
        amount: {
          sel: '.price_color',
          parse: normalizePrice,
        },
        filename: {
          sel: 'h3 a',
          attr: 'title',
        },
        fileurl: {
          sel: 'img',
          attr: 'src',
          parse: (src) => `${baseUrl}/${src}`,
        },
      },
      'article',
    )
    return result.map((doc) => ({
      ...doc,
      // The saveBills function needs a date field
      // even if it is a little artificial here (these are not real bills)
      date: new Date(),
      currency: 'EUR',
      filename: `${format(
        new Date(),
        'yyyy-MM-dd',
      )}_template_${doc.amount.toFixed(2)}EUR${
        doc.vendorRef ? '_' + doc.vendorRef : ''
      }.jpg`,
      vendor: 'template',
    }))
  }
}

// Convert a price string to a float
function normalizePrice(price) {
  return parseFloat(price.replace('£', '').trim())
}

const connector = new TemplateContentScript()
connector.init().catch((err) => {
  console.warn(err)
})
