import ContentScriptBridge from './bridge/ContentScriptBridge.js'

/**
 * All launchers are supposed to implement this interface
 *
 * @interface
 */
class LauncherInterface {
  /**
   * Inject the content script and initialize the bridge to communicate it
   *
   * @param  {Object} options.bridgeOptions : options which will be given as is to the bridge. Bridge options depend on the environment of the launcher
   * @param  {String} options.contentScript : source code of the content script which will be injected
   *
   * @return {Bridge}
   */
  async init({bridgeOptions, contentScript}) {}

  /**
   * Start the connector execution
   *
   * @param  {LauncherRunContext} options.context : current cozy context of the connector
   *
   * @return {Bridge}
   */
  async start({context}) {}

  /**
   * Get content script logs. This function is called by the content script via the bridge
   *
   * @param  {ContentScriptLogMessage} message : log message
   */
  log(message) {}
}

/**
 * This is the launcher implementation for a React native application
 */
export default class ReactNativeLauncher extends LauncherInterface {
  async init({bridgeOptions, contentScript}) {
    this.bridge = new ContentScriptBridge(bridgeOptions)
    this.bridge.webViewRef.injectJavaScript(contentScript)
    const exposedMethodsNames = []
    const exposedMethods = {}
    for (const method of exposedMethodsNames) {
      exposedMethods[method] = this[method].bind(this)
    }
    const listenedEvents = ['log']
    await this.bridge.init({exposedMethods})
    for (const event of listenedEvents) {
      await this.bridge.addEventListener(event, this[event].bind(this))
    }
    return this.bridge
  }

  log(message) {
    console.log('contentscript: ', message)
  }

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

  /**
   * Relay between the webview and the bridge to allow the bridge to work
   */
  onMessage(event) {
    const messenger = this.bridge.messenger
    messenger.onMessage.bind(messenger)(event)
  }
}

/**
 * @typedef LauncherRunContext
 * @property {Object} konnector : connector manifest
 * @property {io.cozy.accounts} : account
 * @property {io.cozy.triggers} : trigger
 * @property {io.cozy.jobs}     : job
 */

/**
 * @typedef ContentScriptLogMessage
 * @property {string} level            : ( debug | info | warning | error | critical). Log level
 * @property {any} message             : message content
 * @property {string | null} label     : user defined label
 * @property {string | null} namespace : user defined namespace
 */
