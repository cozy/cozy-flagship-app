/* eslint-disable no-console */

import {ChildHandshake} from 'post-me'

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

export class LauncherBridge {
  constructor({localWindow}) {
    this.localWindow = localWindow
  }

  async init({exposedMethods = {}} = {}) {
    const messenger = new ContentScriptMessenger({
      localWindow: this.localWindow,
    })
    this.connection = await ChildHandshake(messenger, exposedMethods)
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

class ContentScriptMessenger {
  constructor({localWindow}) {
    this.localWindow = localWindow
  }
  postMessage(message) {
    this.localWindow.ReactNativeWebView.postMessage(JSON.stringify(message))
  }
  addMessageListener(listener) {
    const outerListener = (event) => {
      listener(event)
    }

    this.localWindow.addEventListener('message', outerListener)

    const removeListener = () => {
      this.localWindow.removeEventListener('message', outerListener)
    }

    return removeListener
  }
}
