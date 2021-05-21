import ContentScriptBridge from './bridge/ContentScriptBridge'
import MicroEE from 'microee'
import Minilog from '@cozy/minilog'
import {Q} from 'cozy-client'
import saveFiles from './saveFiles'
import saveBills from './saveBills'

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
   * @return {Bridge}
   */
  async start() {}

  /**
   * Get content script logs. This function is called by the content script via the bridge
   *
   * @param  {ContentScriptLogMessage} message : log message
   */
  log(message) {}
}

/**
 * This is the launcher implementation for a React native application
 *
 * @param {LauncherRunContext} context : current cozy context of the connector
 * @param {Object}             manifest: connector manifest content
 */
class ReactNativeLauncher extends LauncherInterface {
  constructor({context, manifest, client}) {
    super()
    log.debug(context, 'context')
    log.debug(manifest, 'manifest')
    this.startContext = {context, manifest, client}
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
  async start() {
    await this.pilotWebviewBridge.call('ensureAuthenticated')
    this.userData = await this.pilotWebviewBridge.call('getUserDataFromWebsite')

    const {context, client} = this.getStartContext()
    await this.ensureAccountNameAndFolder({
      account: context.account,
      folderId: context.trigger.message.folder_to_save,
      sourceAccountIdentifier: this.userData.sourceAccountIdentifier,
      client,
    })

    const pilotContext = []
    // FIXME not used at the moment since the fetched file will not have the proper "createdByApp"
    // const pilotContext = await this.getPilotContext({
    //   sourceAccountIdentifier: userData.sourceAccountIdentifier,
    //   slug: manifest.slug,
    // })
    await this.pilotWebviewBridge.call('fetch', pilotContext)
    this.emit('CONNECTOR_EXECUTION_END')
    // TODO update the job result when the job is finished
  }

  async getFolderPath({folderId, client}) {
    const result = await client.query(Q('io.cozy.files').getById(folderId))
    return result.data.path
  }

  async ensureAccountNameAndFolder({
    account,
    folderId,
    sourceAccountIdentifier,
    client,
  }) {
    const firstRun = !account.label
    if (!firstRun) {
      return
    }

    log.info('This is the first run')
    const newAccount = await client.save({
      ...account,
      label: sourceAccountIdentifier,
    })
    log.debug(newAccount, 'resulting account')
    // TODO normalize file name
    await client
      .collection('io.cozy.files')
      .updateAttributes(folderId, {name: sourceAccountIdentifier})
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
      log.info(`Got error in runInWorker ${err}`)
      return false
    }
  }

  getStartContext() {
    return this.startContext
  }

  getUserData() {
    return this.userData
  }

  /**
   * Calls cozy-konnector-libs' saveBills function
   *
   * @param {Array} entries : list of file entries to save
   * @returns {Array} list of saved bills
   */
  async saveBills(entries, options) {
    log.debug(entries, 'saveBills entries')
    const {client, context, manifest} = this.getStartContext()
    const {sourceAccountIdentifier} = this.getUserData()
    const result = await saveBills(entries, {
      ...options,
      client,
      manifest,
      sourceAccount: context.job.message.account,
      sourceAccountIdentifier,
    })
    return result
  }

  /**
   * Calls cozy-konnector-libs' saveFiles function
   *
   * @param {Array} entries : list of file entries to save
   * @returns {Array} list of saved files
   */
  async saveFiles(entries, options) {
    log.debug(entries, 'saveFiles entries')
    const {client, context, manifest} = this.getStartContext()
    const {sourceAccountIdentifier} = this.getUserData()
    for (const entry of entries) {
      if (entry.dataUri) {
        entry.filestream = dataURItoArrayBuffer(entry.dataUri).ab
        delete entry.dataUri
      }
    }
    log.info(entries, 'saveFiles entries')
    const result = await saveFiles(
      entries,
      await this.getFolderPath({
        folderId: context.trigger.message.folder_to_save,
        client,
      }),
      {
        ...options,
        client,
        manifest,
        sourceAccount: context.job.message.account,
        sourceAccountIdentifier,
      },
    )
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
   * Reestablish the connection between launcher and the worker after a web page reload
   */
  async restartWorkerConnection(event) {
    log.info('restarting worker', event)

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
