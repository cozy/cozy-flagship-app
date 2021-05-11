import ContentScript from './libs/ContentScript'
import {kyScraper as ky} from './libs/utils'
import Minilog from '@cozy/minilog'
import format from 'date-fns/format'
const log = Minilog('ContentScript')
Minilog.enable()

const baseUrl = 'http://books.toscrape.com'

class TemplateContentScript extends ContentScript {
  async fetch(context) {
    log.debug(context, 'fetch context')
    const resp = await ky.get(baseUrl + '/index.html')
    const entries = await this.parseDocuments(resp)
    await this.saveBills(entries, {
      contentType: 'image/jpeg',
      fileIdAttributes: ['filename'],
      context,
    })
  }

  async getUserDataFromWebsite() {
    return {
      sourceAccountIdentifier: 'template sourceAccountIdentifier',
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
