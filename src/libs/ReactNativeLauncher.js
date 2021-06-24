import MicroEE from 'microee'
import Minilog from '@cozy/minilog'
import {Q} from 'cozy-client'

import ContentScriptBridge from './bridge/ContentScriptBridge'
import {saveFiles, saveBills, saveIdentity} from './connectorLibs'
import {dataURItoArrayBuffer} from './utils'
import LauncherInterface from './LauncherInterface'

const log = Minilog('Launcher')

Minilog.enable()

/**
 * This is the launcher implementation for a React native application
 *
 * @param {LauncherRunContext} context : current cozy context of the connector
 * @param {Object}             manifest: connector manifest content
 */
class ReactNativeLauncher extends LauncherInterface {
  constructor() {
    super()
    this.workerListenedEvents = ['log', 'workerEvent']
  }

  setStartContext(startContext) {
    log.debug(startContext.context, 'context')
    log.debug(startContext.manifest, 'manifest')

    this.startContext = startContext
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
          'saveIdentity',
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
    try {
      await this.pilotWebviewBridge.call('ensureAuthenticated')
      await this.sendLoginSuccess()

      this.userData = await this.pilotWebviewBridge.call(
        'getUserDataFromWebsite',
      )

      await this.ensureAccountNameAndFolder()

      const pilotContext = []
      // FIXME not used at the moment since the fetched file will not have the proper "createdByApp"
      // const pilotContext = await this.getPilotContext({
      //   sourceAccountIdentifier: userData.sourceAccountIdentifier,
      //   slug: manifest.slug,
      // })
      await this.pilotWebviewBridge.call('fetch', pilotContext)
      await this.updateJobResult()
    } catch (err) {
      log.error(err, 'start error')
      await this.updateJobResult({
        result: false,
        error: err.message,
      })
    }
    this.emit('CONNECTOR_EXECUTION_END')
  }

  /**
   * Updates the result of the current job
   *
   * @param {Boolean} options.result - Final result of the job. Default to true
   * @param {String} options.error - Job error message if any
   *
   * @returns {JobDocument}
   */
  async updateJobResult({result = true, error}) {
    const {context, client} = this.getStartContext()
    return await client.save({
      ...context.job,
      attributes: {
        ...context.job.attributes,
        ...{state: result ? 'done' : 'errored', error},
      },
    })
  }

  /**
   * Get the folder path of any folder, given it's Id
   *
   * @param {String} folderId - Id of the folder
   *
   * @returns {String} Folder path
   */
  async getFolderPath(folderId) {
    const {client} = this.getStartContext()
    const result = await client.query(Q('io.cozy.files').getById(folderId))
    return result.data.path
  }

  /**
   * Updates the account to send the LOGIN_SUCCESS message to harvest
   */
  async sendLoginSuccess() {
    const {context, client} = this.getStartContext()
    const updatedAccount = await client.query(
      Q('io.cozy.accounts').getById(context.account._id),
    )
    await client.save({
      ...updatedAccount.data,
      state: 'LOGIN_SUCCESS',
    })
  }

  /**
   * Ensure that the account and the destination folder get the name corresponding to sourceAccountIdentifier
   */
  async ensureAccountNameAndFolder() {
    const {context, client} = this.getStartContext()

    const firstRun = !context.account.label
    if (!firstRun) {
      return
    }

    const {sourceAccountIdentifier} = this.getUserData()
    const folderId = context.trigger.message.folder_to_save

    log.info('This is the first run')
    const updatedAccount = await client.query(
      Q('io.cozy.accounts').getById(context.account._id),
    )
    const newAccount = await client.save({
      ...updatedAccount.data,
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
  async runInWorker(method, ...args) {
    log.debug('runInworker called')
    try {
      return await new Promise((resolve, reject) => {
        this.once('WORKER_RELOAD', () => reject('WORKER_RELOAD'))
        log.debug(`calling ${method} on worker`)
        this.workerWebviewBridge.call(method, ...args).then(resolve)
      })
    } catch (err) {
      log.info(`Got error in runInWorker ${err}`)
      return false
    }
  }

  /**
   * Get the context given from Harvest to the launcher
   *
   * @returns {LauncherRunContext}
   */
  getStartContext() {
    return this.startContext
  }

  /**
   * Get user unique identifier data, that the connector got after beeing authentified
   *
   * @returns {Object}
   */
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
        entry.filestream = dataURItoArrayBuffer(entry.dataUri).arrayBuffer
        delete entry.dataUri
      }
    }
    log.info(entries, 'saveFiles entries')
    const result = await saveFiles(
      entries,
      await this.getFolderPath(context.trigger.message.folder_to_save),
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
   * Calls cozy-konnector-libs' saveIdentifier function
   *
   * @param {Object} contact : contact object
   */
  async saveIdentity(contact) {
    const {client} = this.getStartContext()
    log.debug(contact, 'saveIdentity contact')
    const {sourceAccountIdentifier} = this.getUserData()
    await saveIdentity(contact, sourceAccountIdentifier, {client})
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
    const {client} = this.getStartContext()
    const result = await client.queryAll(
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
   * This method creates and inits a content script bridge to the launcher with some facilities to make
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
