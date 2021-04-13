import ContentScript from './libs/ContentScript'

class TestContentScript extends ContentScript {
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

const connector = new TestContentScript()
connector.init().catch((err) => {
  console.error(err)
})
