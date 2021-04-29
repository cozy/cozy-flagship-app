import ContentScript from './libs/ContentScript'
import {kyScraper} from './libs/utils'
import Minilog from '@cozy/minilog'

const log = Minilog('ContentScript')
window.Minilog = Minilog

class TemplateContentScript extends ContentScript {
  async fetch() {}
}

const connector = new TemplateContentScript()
connector.init().catch((err) => {
  console.warn(err)
})
