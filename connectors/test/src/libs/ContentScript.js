import LauncherBridge from './bridge/LauncherBridge'

export default class ContentScript {
  async init() {
    this.bridge = new LauncherBridge({localWindow: window})
    const exposedMethodsNames = [
      'ensureAuthenticated',
      'getAccountInformation',
      'fetch',
    ]
    const exposedMethods = {}
    // TODO error handling
    // should catch and call onError on the launcher to let it handle the job update
    for (const method of exposedMethodsNames) {
      exposedMethods[method] = this[method].bind(this)
    }
    await this.bridge.init({exposedMethods})
  }
  log(message) {
    this.bridge.emit('log', message)
  }
  async ensureAuthenticated() {}
  async getAccountInformation() {}
  async fetch({context}) {}
}
