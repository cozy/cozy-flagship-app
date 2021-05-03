import ContentScript from './libs/ContentScript'
import {kyScraper as ky} from './libs/utils'
import Minilog from '@cozy/minilog'
const log = Minilog('ContentScript')
Minilog.enable()

const baseUrl = 'http://books.toscrape.com'

class TemplateContentScript extends ContentScript {
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
      sourceAccountIdentifier: 'template sourceAccountIdentifier',
    }
  }

  async parseDocuments(resp) {
    const result = await resp.scrape(
      {
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
    return result
  }
}

const connector = new TemplateContentScript()
connector.init().catch((err) => {
  console.warn(err)
})
