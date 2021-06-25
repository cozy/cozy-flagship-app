import MicroEE from 'microee'
import Minilog from '@cozy/minilog'
import {Q} from 'cozy-client'

import ContentScriptBridge from './bridge/ContentScriptBridge'
import {saveFiles, saveBills, saveIdentity} from './connectorLibs'
import {dataURItoArrayBuffer} from './utils'
import Launcher from './Launcher'

const log = Minilog('Launcher')

Minilog.enable()

/**
 * This is the launcher implementation for a React native application
 */
class ReactNativeLauncher extends Launcher {
  constructor() {
    super()
    this.workerListenedEventsNames = ['log', 'workerEvent']
  }

  async init({bridgeOptions, contentScript}) {
    log.debug('bridges init start')
    const promises = [
      this.initPilotContentScriptBridge({
        webViewRef: bridgeOptions.pilotWebView,
        contentScript,
        exposedMethodsNames: [
          'setWorkerState',
          'runInWorker',
          'saveFiles',
          'saveBills',
          'saveIdentity',
        ],
        listenedEventsNames: ['log'],
      }),
      this.initWorkerContentScriptBridge({
        webViewRef: bridgeOptions.workerWebview,
        contentScript,
        exposedMethodsNames: [],
        listenedEventsNames: this.workerListenedEventsNames,
      }),
    ]
    await Promise.all(promises)
    log.debug('bridges init done')
  }

  async start() {
    try {
      await this.pilot.call('ensureAuthenticated')
      await this.sendLoginSuccess()

      this.userData = await this.pilot.call('getUserDataFromWebsite')

      await this.ensureAccountNameAndFolder()

      const pilotContext = []
      // FIXME not used at the moment since the fetched file will not have the proper "createdByApp"
      // const pilotContext = await this.getPilotContext({
      //   sourceAccountIdentifier: userData.sourceAccountIdentifier,
      //   slug: manifest.slug,
      // })
      await this.pilot.call('fetch', pilotContext)
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

  async close() {
    this.pilot.close()
    this.worker.close()
  }

  /**
   * Updates the result of the current job
   *
   * @param {Boolean} options.result - Final result of the job. Default to true
   * @param {String} options.error - Job error message if any
   *
   * @returns {JobDocument}
   */
  async updateJobResult({result = true, error} = {}) {
    const {job, client} = this.getStartContext()
    return await client.save({
      ...job,
      attributes: {
        ...job.attributes,
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
    const {account, client} = this.getStartContext()
    const updatedAccount = await client.query(
      Q('io.cozy.accounts').getById(account._id),
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
    const {trigger, account, client} = this.getStartContext()

    const firstRun = !account.label
    if (!firstRun) {
      return
    }

    const {sourceAccountIdentifier} = this.getUserData()
    const folderId = trigger.message.folder_to_save

    log.info('This is the first run')
    const updatedAccount = await client.query(
      Q('io.cozy.accounts').getById(account._id),
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
        this.worker.call(method, ...args).then(resolve)
      })
    } catch (err) {
      log.info(`Got error in runInWorker ${err}`)
      return false
    }
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
    const {client, job, manifest} = this.getStartContext()
    const {sourceAccountIdentifier} = this.getUserData()
    const result = await saveBills(entries, {
      ...options,
      client,
      manifest,
      sourceAccount: job.message.account,
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
    const {client, trigger, job, manifest} = this.getStartContext()
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
      await this.getFolderPath(trigger.message.folder_to_save),
      {
        ...options,
        client,
        manifest,
        sourceAccount: job.message.account,
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
      await this.worker.init({
        listenedEventsNames: this.workerListenedEventsNames,
      })
    } catch (err) {
      throw new Error(`worker bridge restart init error: ${err.message}`)
    }
    log.info('webworker bridge connection restarted')
  }

  /**
   * This method creates and inits the pilot content script bridge to the launcher with some facilities to make
   * it's own method callable by the content script
   *
   * @param {WebView} options.webViewRef : WebView object to link to the launcher thanks to the bridge
   * @param {Array.<String>} options.exposedMethodsNames : list of methods of the launcher to expose to the content script
   * @param {Array.<String>} options.listenedEventsNames : list of methods of the launcher to link to content script emitted events
   */
  async initPilotContentScriptBridge({
    webViewRef,
    exposedMethodsNames,
    listenedEventsNames,
  }) {
    // the bridge must be exposed before the call to the ContentScriptBridge.init function or else the init sequence won't work
    // since the init sequence needs an already working bridge
    this.pilot = new ContentScriptBridge()
    try {
      await this.pilot.init({
        root: this,
        exposedMethodsNames,
        listenedEventsNames,
        webViewRef,
      })
    } catch (err) {
      throw new Error(`Init error in pilot: ${err.message}`)
    }
  }

  /**
   * This method creates and inits the worker content script bridge to the launcher with some facilities to make
   * it's own method callable by the content script
   *
   * @param {WebView} options.webViewRef : WebView object to link to the launcher thanks to the bridge
   * @param {Array.<String>} options.exposedMethodsNames : list of methods of the launcher to expose to the content script
   * @param {Array.<String>} options.listenedEventsNames : list of methods of the launcher to link to content script emitted events
   */
  async initWorkerContentScriptBridge({
    webViewRef,
    exposedMethodsNames,
    listenedEventsNames,
  }) {
    // the bridge must be exposed before the call to the ContentScriptBridge.init function or else the init sequence won't work
    // since the init sequence needs an already working bridge
    this.worker = new ContentScriptBridge()
    try {
      await this.worker.init({
        root: this,
        exposedMethodsNames,
        listenedEventsNames,
        webViewRef,
      })
    } catch (err) {
      throw new Error(`Init error in worker: ${err.message}`)
    }
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
    this.pilot.emit('workerEvent', event)
  }

  /**
   * Relay between the pilot webview and the bridge to allow the bridge to work
   */
  onPilotMessage(event) {
    if (this.pilot) {
      const messenger = this.pilot.messenger
      messenger.onMessage.bind(messenger)(event)
    }
  }

  /**
   * Relay between the worker webview and the bridge to allow the bridge to work
   */
  onWorkerMessage(event) {
    if (this.worker) {
      const messenger = this.worker.messenger
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
 * @typedef ContentScriptLogMessage
 * @property {string} level            : ( debug | info | warning | error | critical). Log level
 * @property {any} message             : message content
 * @property {string | null} label     : user defined label
 * @property {string | null} namespace : user defined namespace
 */

MicroEE.mixin(ReactNativeLauncher)
export default ReactNativeLauncher
