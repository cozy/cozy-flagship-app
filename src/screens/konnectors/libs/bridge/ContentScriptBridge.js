import {ParentHandshake} from 'post-me'
import LauncherMessenger from './LauncherMessenger.js'

export default class ContentScriptBridge {
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
