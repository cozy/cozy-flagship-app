import {ParentHandshake} from 'post-me'

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
  // TODO define exposed methods if any
}

export class ContentScriptBridge {
  constructor({webViewRef}) {
    this.webViewRef = webViewRef
  }

  async init({exposedMethods = {}} = {}) {
    this.messenger = new LauncherMessenger({
      webViewRef: this.webViewRef,
    })
    this.connection = await ParentHandshake(this.messenger, exposedMethods)
    this.localHandle = this.connection.localHandle()
    this.remoteHandle = this.connection.remoteHandle()
  }

  async call(...args) {
    return this.remoteHandle.call(...args)
  }

  async emit(...args) {
    return this.localHandle.emit(...args)
  }

  async addEventListener(...args) {
    this.remoteHandle.addEventListener(...args)
  }
}

class LauncherMessenger {
  constructor({webViewRef}) {
    this.webViewRef = webViewRef
  }

  postMessage(message) {
    // console.log('postMessage(message)', message)
    const script = `window.postMessage(${JSON.stringify(message)})`
    this.webViewRef.injectJavaScript(script)
  }
  addMessageListener(listener) {
    this.listener = listener

    const removeListener = () => {
      this.listener = null
    }

    return removeListener
  }

  onMessage(event) {
    const data = JSON.parse(event.nativeEvent.data)
    // console.log('onMessage data', data)
    this.listener({data})
  }
}
