import {ParentHandshake} from 'post-me'
import {Bridge} from './bridgeInterfaces'
import ReactNativeLauncherMessenger from './ReactNativeLauncherMessenger'

const DEBUG_BRIDGE = false

/**
 * Bridge to the contentScript object via post-me
 */
export default class ContentScriptBridge extends Bridge {
  async init({
    root,
    exposedMethodsNames = [],
    listenedEventsNames = [],
    webViewRef,
    label,
    debug = DEBUG_BRIDGE,
  } = {}) {
    if (root) {
      this.root = root
    }
    if (webViewRef) {
      this.webViewRef = webViewRef
    }
    this.close()

    this.messenger = new ReactNativeLauncherMessenger({
      webViewRef: this.webViewRef,
      debug,
      label,
    })

    this.connection = await ParentHandshake(
      this.messenger,
      this.bindExposedMethods(this.root, exposedMethodsNames),
      50,
      100,
    )

    this.localHandle = this.connection.localHandle()
    this.remoteHandle = this.connection.remoteHandle()

    this.attachEvents(this.root, listenedEventsNames)

    return this.connection
  }

  /**
   * Binds the listed methods to the root object
   *
   * @param {Object} root - Root object which will have exposed methods bound
   * @param {Array.<String>} exposedMethodsNames - List of root methods which will be callable by the content script via post-me interface
   * @returns {Object}
   */
  bindExposedMethods(root, exposedMethodsNames) {
    const exposedMethods = {}
    for (const method of exposedMethodsNames) {
      exposedMethods[method] = root[method].bind(root)
    }
    return exposedMethods
  }

  /**
   * Attach content script events to the methods of the root object with the same name
   *
   * @param {Object} root - Root object which will have events attached
   * @param {Array.<String>} listenedEventsNames - List of root methods which will get called when the named events occur
   */
  attachEvents(root, listenedEventsNames) {
    for (const event of listenedEventsNames) {
      this.addEventListener(event, root[event].bind(root))
    }
  }

  close() {
    if (this.connection) {
      this.connection.close()
    }
  }
}
