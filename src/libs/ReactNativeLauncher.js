import MicroEE from 'microee'
import Minilog from '@cozy/minilog'

import ContentScriptBridge from './bridge/ContentScriptBridge'
import Launcher from './Launcher'
import * as ConnectorInstaller from './ConnectorInstaller'

const log = Minilog('ReactNativeLauncher')

Minilog.enable()

/**
 * This is the launcher implementation for a React native application
 */
class ReactNativeLauncher extends Launcher {
  constructor() {
    super()
    this.workerMethodNames = ['sendToPilot']
    this.workerListenedEventsNames = ['log', 'workerEvent', 'workerReady']
  }

  async init({ bridgeOptions, contentScript }) {
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
          'setUserAgent',
          'getCredentials',
          'saveCredentials'
        ],
        listenedEventsNames: ['log']
      }),
      this.initWorkerContentScriptBridge({
        webViewRef: bridgeOptions.workerWebview,
        contentScript,
        exposedMethodsNames: this.workerMethodNames,
        listenedEventsNames: this.workerListenedEventsNames
      })
    ]
    await Promise.all(promises)
    log.debug('bridges init done')
  }

  async ensureConnectorIsInstalled({ connector, client }) {
    await ConnectorInstaller.ensureConnectorIsInstalled({
      ...connector,
      client
    })
    const content = await ConnectorInstaller.getContentScript(connector)
    const manifest = await ConnectorInstaller.getManifest(connector)
    return { content, manifest }
  }

  async stop({ message } = {}) {
    if (message) {
      await this.updateJobResult({
        state: 'errored',
        error: message
      })
    } else {
      await this.updateJobResult()
    }
    this.close()
  }

  async start({ initConnectorError } = {}) {
    try {
      if (initConnectorError) {
        log.info('Got initConnectorError ' + initConnectorError.message)
        throw initConnectorError
      }
      await this.pilot.call('setContentScriptType', 'pilot')
      await this.worker.call('setContentScriptType', 'worker')
      await this.pilot.call('ensureAuthenticated')
      await this.sendLoginSuccess()

      this.setUserData(await this.pilot.call('getUserDataFromWebsite'))
      await this.ensureAccountNameAndFolder()

      const pilotContext = []
      // FIXME not used at the moment since the fetched file will not have the proper "createdByApp"
      // const pilotContext = await this.getPilotContext({
      //   sourceAccountIdentifier: userData.sourceAccountIdentifier,
      //   slug: manifest.slug,
      // })
      await this.pilot.call('fetch', pilotContext)
      await this.stop()
    } catch (err) {
      log.error(err, 'start error')
      await this.stop({ message: err.message })
    }
    this.emit('CONNECTOR_EXECUTION_END')
  }

  async close() {
    if (this.pilot) {
      this.pilot.close()
    }
    if (this.worker) {
      this.worker.close()
    }
  }

  /**
   * @typedef SetWorkerStateOptions
   * @property {String} url      : url displayed by the worker webview for the login
   * @property {Boolean} visible : will the worker be visible or not
   */

  /**
   * Makes the launcherView display the worker webview
   *
   * @param {SetWorkerStateOptions} options
   */
  async setWorkerState(options) {
    this.emit('SET_WORKER_STATE', options)
  }

  /**
   * Set the user agent for launcherView's webviews
   *
   * @param {String} userAgent
   */
  async setUserAgent(userAgent) {
    this.emit('SET_USER_AGENT', userAgent)
  }

  /**
   * Run the specified method in the worker and make it fail with WORKER_WILL_RELOAD message
   * if the worker page is reloaded
   *
   * @param {String} method
   * @returns {any} the worker method return value
   */
  async runInWorker(method, ...args) {
    log.debug('runInworker called')
    try {
      return await new Promise((resolve, reject) => {
        this.once('WORKER_WILL_RELOAD', () => {
          // we need to reject once the worker is back and ready.
          // This way, the pilot can call the worker one more time
          // and be sure it is ready
          this.once('WORKER_RELOADED', () => {
            reject('WORKER_RELOADED')
          })
        })
        log.debug(`calling ${method} on worker`)
        // eslint-disable-next-line promise/catch-or-return
        this.worker.call(method, ...args).then(resolve)
      })
    } catch (err) {
      log.info(`Got error in runInWorker ${err}`)
      return false
    }
  }

  async sendToPilot(obj) {
    await this.pilot.call('storeFromWorker', obj)
  }

  /**
   * Reestablish the connection between launcher and the worker after a web page reload
   */
  async restartWorkerConnection(event) {
    log.info('restarting worker', event)

    try {
      await this.worker.close()
      await this.worker.init({
        exposedMethodsNames: this.workerMethodNames,
        listenedEventsNames: this.workerListenedEventsNames,
        label: 'worker'
      })
      await this.worker.call('setContentScriptType', 'worker')
    } catch (err) {
      throw new Error(`worker bridge restart init error: ${err.message}`)
    }
    this.emit('WORKER_RELOADED')
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
    listenedEventsNames
  }) {
    // the bridge must be exposed before the call to the ContentScriptBridge.init function or else the init sequence won't work
    // since the init sequence needs an already working bridge
    this.pilot = new ContentScriptBridge({ label: 'pilot' })
    try {
      await this.pilot.init({
        root: this,
        exposedMethodsNames,
        listenedEventsNames,
        webViewRef,
        label: 'pilot'
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
    listenedEventsNames
  }) {
    // the bridge must be exposed before the call to the ContentScriptBridge.init function or else the init sequence won't work
    // since the init sequence needs an already working bridge
    this.worker = new ContentScriptBridge({ label: 'worker' })
    try {
      await this.worker.init({
        root: this,
        exposedMethodsNames,
        listenedEventsNames,
        webViewRef,
        label: 'worker'
      })
    } catch (err) {
      throw new Error(`Init error in worker: ${err.message}`)
    }
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
   * Called when the worker is ready to be called
   */
  workerReady() {
    this.emit('WORKER_READY')
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
    this.emit('WORKER_WILL_RELOAD')
    this.restartWorkerConnection(event)
    return true // allows the webview to load the new page
  }
}

MicroEE.mixin(ReactNativeLauncher)
export default ReactNativeLauncher
