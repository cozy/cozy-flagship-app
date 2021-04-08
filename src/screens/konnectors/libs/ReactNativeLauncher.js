import ContentScriptBridge from './bridge/ContentScriptBridge.js'

export default class ReactNativeLauncher {
  async init({webViewRef, contentScript}) {
    webViewRef.injectJavaScript(contentScript)
    this.bridge = new ContentScriptBridge({webViewRef})
    const exposedMethodsNames = ['saveFiles', 'saveBills']
    const exposedMethods = {}
    for (const method of exposedMethodsNames) {
      exposedMethods[method] = this[method].bind(this)
    }
    const listenedEvents = ['log']
    await this.bridge.init({exposedMethods})
    for (const event of listenedEvents) {
      await this.bridge.addEventListener(event, this[event].bind(this))
    }
  }

  log(message) {
    console.log('contentscript: ', message)
  }

  saveFiles() {}

  saveBills() {}

  async start({context}) {
    // TODO
    // * need the cozy url + token
    // * get remote context if launcher has a destination folder + get all the documents in doctypes
    // declared in the manifest and created by the given account (or sourceAccountIdentifier ?
    await this.bridge.call('ensureAuthenticated')
    const accountInformation = await this.bridge.call('getAccountInformation')
    console.log('accountInformation', accountInformation)
    // await this.saveAccountInformation(accountInformation, context)
    // this.folder = await this.ensureDestinationFolder(
    //   accountInformation,
    //   context,
    // )
    const result = await this.bridge.call('fetch', {context})
    console.log('result', result)
    // TODO update the job result when the job
  }
  onMessage(event) {
    const messenger = this.bridge.messenger
    messenger.onMessage.bind(messenger)(event)
  }
}
