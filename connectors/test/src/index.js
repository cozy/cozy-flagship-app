/* eslint-disable no-console */

import ContentScript from './libs/ContentScript'

class TestContenScript extends ContentScript {
  async ensureAuthenticated() {
    return true
  }
  async getAccountInformation() {
    return {
      email: 'toto@cozycloud.cc',
    }
  }
  async fetch() {
    this.log('data is fetched')
    return 'fetch result'
  }
}

const connector = new TestContenScript()
connector.init().catch((err) => {
  console.error(err)
})
