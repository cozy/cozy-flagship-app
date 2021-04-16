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
  constructor({launcherView}) {
    super()
    this.launcherView = launcherView
  }

  async init({bridgeOptions, contentScript}) {
    console.time('bridges init')
    const promises = [
      this.initWebview({
        bridgeName: 'mainWebviewBridge',
        webViewRef: bridgeOptions.mainWebView,
        contentScript,
        exposedMethodsNames: ['doLogin'],
        listenedEvents: ['log'],
      }),
    ]
    if (bridgeOptions.workerWebview) {
      promises.push(
        this.initWebview({
          bridgeName: 'workerWebviewBridge',
          webViewRef: bridgeOptions.workerWebview,
          contentScript,
          exposedMethodsNames: [],
          listenedEvents: ['log'],
        }),
      )
    }
    await Promise.all(promises)
    console.timeEnd('bridges init')
  }
  async start({context}) {
    await this.mainWebviewBridge.call('ensureAuthenticated')
    // TODO
    // * need the cozy url + token
    // * get remote context if launcher has a destination folder + get all the documents in doctypes
    // declared in the manifest and created by the given account (or sourceAccountIdentifier ?
    // TODO update the job result when the job is finished
  }

  async doLogin(url) {
    this.launcherView.setState({
      workerUrl: url,
    })
  }

  async initWebview({
    bridgeName,
    webViewRef,
    contentScript,
    exposedMethodsNames,
    listenedEvents,
  }) {
    const webviewBridge = new ContentScriptBridge({
      webViewRef,
    })
    this[bridgeName] = webviewBridge
    const exposedMethods = {}
    for (const method of exposedMethodsNames) {
      exposedMethods[method] = this[method].bind(this)
    }
    await webviewBridge.init({exposedMethods})
    for (const event of listenedEvents) {
      await webviewBridge.addEventListener(event, this[event].bind(this))
    }
    return webviewBridge
  }

  log(message) {
    console.log('contentscript: ', message)
  }

  /**
   * Relay between the webview and the bridge to allow the bridge to work
   */
  onMainMessage(event) {
    if (this.mainWebviewBridge) {
      const messenger = this.mainWebviewBridge.messenger
      messenger.onMessage.bind(messenger)(event)
    }
  }

  onWorkerMessage(event) {
    if (this.workerWebviewBridge) {
      const messenger = this.workerWebviewBridge.messenger
      messenger.onMessage.bind(messenger)(event)
    }
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
