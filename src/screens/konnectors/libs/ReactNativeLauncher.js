import ContentScriptBridge from './bridge/ContentScriptBridge'
import MicroEE from 'microee'
import Minilog from '@cozy/minilog'
import CozyClient, {Q} from 'cozy-client'
import {url, token} from '../../../../token.json'
import {decode} from 'base-64'
import saveFiles from './saveFiles'
import saveBills from './saveBills'
if (!global.atob) {
  global.atob = decode
}

const log = Minilog('Launcher')

Minilog.enable()

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
class ReactNativeLauncher extends LauncherInterface {
  constructor(context) {
    super()
    log.debug(context, 'context')
    this.context = context
    this.workerListenedEvents = ['log', 'workerEvent']
  }
  async init({bridgeOptions, contentScript}) {
    log.debug('bridges init start')
    const promises = [
      this.initContentScriptBridge({
        bridgeName: 'pilotWebviewBridge',
        webViewRef: bridgeOptions.pilotWebView,
        contentScript,
        exposedMethodsNames: [
          'setWorkerState',
          'runInWorker',
          'saveFiles',
          'saveBills',
        ],
        listenedEvents: ['log'],
      }),
      this.initContentScriptBridge({
        bridgeName: 'workerWebviewBridge',
        webViewRef: bridgeOptions.workerWebview,
        contentScript,
        exposedMethodsNames: [],
        listenedEvents: this.workerListenedEvents,
      }),
    ]
    await Promise.all(promises)
    log.debug('bridges init done')
  }
  async start({context}) {
    this.userData = await this.pilotWebviewBridge.call('getUserDataFromWebsite')
    const {sourceAccountIdentifier} = this.userData
    this.client = this.getClient({
      context: this.context,
      sourceAccountIdentifier,
    })
    const slug = this.context.manifest.slug
    const pilotContext = await this.getPilotContext({
      sourceAccountIdentifier,
      slug,
    })
    await this.pilotWebviewBridge.call('fetch', pilotContext)
    // TODO update the job result when the job is finished
  }

  /**
   * Makes the launcherView display the worker webview
   *
   * @param {String} url : url displayed by the worker webview for the login
   */
  async setWorkerState(options) {
    this.emit('SET_WORKER_STATE', options)
  }

  /**
   * Run the specified method in the worker and make it fail with WORKER_RELOAD message
   * if the worker page is reloaded
   *
   * @param {String} method
   * @returns {any} the worker method return value
   */
  async runInWorker(method) {
    log.debug('runInworker called')
    try {
      return await new Promise((resolve, reject) => {
        this.once('WORKER_RELOAD', () => reject('WORKER_RELOAD'))
        log.debug(`calling ${method} on worker`)
        this.workerWebviewBridge.call(method).then(resolve)
      })
    } catch (err) {
      log.error(`Got error in runInWorker ${err}`)
      return false
    }
  }

  /**
   * Calls cozy-konnector-libs' saveBills function
   *
   * @param {Array} entries : list of file entries to save
   * @param {String} options.folderPath : folder path relative to the connector folder path (default '/')
   * @returns {Array} list of saved bills
   */
  async saveBills(entries, options) {
    log.debug(entries, 'saveBills entries')
    options.client = this.client
    options.manifest = this.context.manifest
    options.sourceAccount = this.context.job.message.account
    const {sourceAccountIdentifier} = this.userData
    if (sourceAccountIdentifier) {
      options.sourceAccountIdentifier = sourceAccountIdentifier
    }
    const result = await saveBills(entries, options)
    return result
  }

  /**
   * Calls cozy-konnector-libs' saveFiles function
   *
   * @param {Array} entries : list of file entries to save
   * @param {String} options.folderPath : folder path relative to the connector folder path (default '/')
   * @returns {Array} list of saved files
   */
  async saveFiles(entries, options) {
    log.debug(entries, 'saveFiles entries')

    options.client = this.client
    options.manifest = this.context.manifest
    options.sourceAccount = this.context.job.message.account
    const {sourceAccountIdentifier} = this.userData
    if (sourceAccountIdentifier) {
      options.sourceAccountIdentifier = sourceAccountIdentifier
    }
    for (const entry of entries) {
      if (entry.dataUri) {
        entry.filestream = dataURItoArrayBuffer(entry.dataUri).ab
        delete entry.dataUri
      }
    }
    log.info(entries, 'saveFiles entries')
    const result = await saveFiles(entries, '/Administratif', options)
    log.info(result, 'saveFiles result')

    return result
  }

  /**
   * Fetches data already imported by the connector with the current sourceAccountIdentifier
   * This allows the connector to only fetch new data
   *
   * @param {String} options.sourceAccountIdentifier: current account unique identifier
   * @param {String} options.slug: connector slug
   * @returns {Object}
   */
  async getPilotContext({sourceAccountIdentifier, slug}) {
    const result = await this.client.queryAll(
      Q('io.cozy.files')
        .where({
          trashed: false,
          cozyMetadata: {
            sourceAccountIdentifier,
            createdByApp: slug,
          },
        })
        .indexFields([
          'trashed',
          'cozyMetadata.sourceAccountIdentifier',
          'cozyMetadata.createdByApp',
        ]),
    )

    return result
  }

  /**
   * cozy-client object initialization
   *
   * @param {Object} manifest
   * @returns {CozyClient}
   */
  getClient({context, sourceAccountIdentifier}) {
    const manifest = context.manifest
    const sourceAccount = context.job.message.account
    return new CozyClient({
      token: token,
      uri: url,
      appMetadata: {
        slug: manifest.slug,
        version: manifest.version,
        sourceAccount,
        sourceAccountIdentifier,
      },
    })
  }

  /**
   * Reestablish the connection between launcher and the worker after a web page reload
   */
  async restartWorkerConnection(event) {
    log.warn('restarting worker', event)

    try {
      await this.workerWebviewBridge.init()
      for (const eventName of this.workerListenedEvents) {
        this.workerWebviewBridge.addEventListener(
          eventName,
          this[eventName].bind(this),
        )
      }
    } catch (err) {
      throw new Error(`worker bridge restart init error: ${err.message}`)
    }
    log.info('webworker bridge connection restarted')
  }

  /**
   * This method creates and init a content script bridge to the launcher with some facilities to make
   * it's own method callable by the content script
   *
   * @param {String} options.bridgeName : Name of the attribute where the bridge instance will be placed
   * @param {WebView} options.webViewRef : WebView object to link to the launcher thanks to the bridge
   * @param {Array.<String>} options.exposedMethodsNames : list of methods of the launcher to expose to the content script
   * @param {Array.<String>} options.listenedEvents : list of methods of the launcher to link to content script emitted events
   * @returns {ContentScriptBridge}
   */
  async initContentScriptBridge({
    bridgeName,
    webViewRef,
    exposedMethodsNames,
    listenedEvents,
  }) {
    const webviewBridge = new ContentScriptBridge({webViewRef})
    const exposedMethods = {}
    for (const method of exposedMethodsNames) {
      exposedMethods[method] = this[method].bind(this)
    }
    // the bridge must be exposed before the call to the webviewBridge.init function or else the init sequence won't work
    // since the init sequence needs an already working bridge
    this[bridgeName] = webviewBridge
    try {
      await webviewBridge.init({exposedMethods})
    } catch (err) {
      throw new Error(`Init error ${bridgeName}: ${err.message}`)
    }
    for (const event of listenedEvents) {
      webviewBridge.addEventListener(event, this[event].bind(this))
    }
    return webviewBridge
  }

  /**
   * log messages emitted from the worker and the pilot
   *
   * @param {String} message
   */
  log(message) {
    Minilog('ContentScript').info(message)
  }

  /**
   * Relays events from the worker to the pilot
   *
   * @param {Object} event
   */
  workerEvent(event) {
    this.pilotWebviewBridge.emit('workerEvent', event)
  }

  /**
   * Relay between the pilot webview and the bridge to allow the bridge to work
   */
  onPilotMessage(event) {
    if (this.pilotWebviewBridge) {
      const messenger = this.pilotWebviewBridge.messenger
      messenger.onMessage.bind(messenger)(event)
    }
  }

  /**
   * Relay between the worker webview and the bridge to allow the bridge to work
   */
  onWorkerMessage(event) {
    if (this.workerWebviewBridge) {
      const messenger = this.workerWebviewBridge.messenger
      messenger.onMessage.bind(messenger)(event)
    }
  }

  /**
   * Actions to do before the worker reloads : restart the connection
   */
  onWorkerWillReload(event) {
    this.emit('WORKER_RELOAD')
    this.restartWorkerConnection(event)
    return true // allows the webview to load the new page
  }
}

function dataURItoArrayBuffer(dataURI) {
  const [contentType, base64String] = dataURI
    .match(/^data:(.*);base64,(.*)$/)
    .slice(1)
  const byteString = global.atob(base64String)
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return {contentType, ab}
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

MicroEE.mixin(ReactNativeLauncher)
export default ReactNativeLauncher
