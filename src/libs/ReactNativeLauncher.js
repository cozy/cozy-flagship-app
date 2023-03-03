import MicroEE from 'microee'
import Minilog from '@cozy/minilog'

import ContentScriptBridge from './bridge/ContentScriptBridge'

import CookieManager from '@react-native-cookies/cookies'

import Launcher from './Launcher'

import { getKonnectorBundle } from '/libs/cozyAppBundle/cozyAppBundle.functions'

import { saveCookie, getCookie, removeCookie } from './keychain'

import { updateCozyAppBundle } from '/libs/cozyAppBundle/cozyAppBundle'
import { sendKonnectorsLogs } from '/libs/konnectors/sendKonnectorsLogs'

const log = Minilog('ReactNativeLauncher')

Minilog.enable()

/**
 * This is the launcher implementation for a React native application
 */
class ReactNativeLauncher extends Launcher {
  constructor() {
    super()
    this.workerMethodNames = [
      'sendToPilot',
      'getCookiesByDomain',
      'getCookieByDomainAndName',
      'getCookieFromKeychainByName'
    ]
    this.workerListenedEventsNames = ['log', 'workerEvent', 'workerReady']

    this.controller = new AbortController()
  }

  setLogger(onKonnectorLog) {
    this.logger = onKonnectorLog
  }

  log(logContent) {
    const context = this.getStartContext()
    const slug = context.manifest.slug
    this.logger({ ...logContent, slug })
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
          'saveCredentials',
          'getCookiesByDomain',
          'saveCookieToKeychain',
          'getCookieByDomainAndName',
          'getCookieFromKeychainByName'
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

  async ensureKonnectorIsInstalled({ slug, client }) {
    try {
      await updateCozyAppBundle({
        slug,
        client,
        type: 'konnectors'
      })
    } catch (error) {
      log.error(
        `Error while checking if the "${slug}" konnector has a new version available.
        Still attempting to get a cached version.`,
        error
      )
    }

    try {
      const bundle = await getKonnectorBundle({ client, slug })

      if (!bundle) throw new Error('No konnector bundle found')

      return bundle
    } catch (error) {
      throw new Error(
        `Critical error while ensuring "${slug}" konnector is installed.
        The konnector will not be able to run.`,
        error
      )
    }
  }

  async stop({ message } = {}) {
    const context = this.getStartContext()
    const client = context.client
    await sendKonnectorsLogs(client)
    if (message) {
      await this.updateJobResult({
        state: 'errored',
        error: message
      })
    } else {
      await this.updateJobResult()
    }
    this.emit('STOPPED_JOB')
    this.close()
  }

  async start(...args) {
    return new Promise(resolve => {
      this.controller.signal.addEventListener('abort', () => {
        log('info', `Konnector launch was aborted`)
        resolve('abort')
      })
      this._start(...args)
        .then(() => {
          return resolve()
        })
        .catch(err => {
          log('err', 'An error in launcher.start was not caught : ', err)
        })
    })
  }

  async _start({ initKonnectorError } = {}) {
    try {
      if (initKonnectorError) {
        log.info('Got initKonnectorError ' + initKonnectorError.message)
        throw initKonnectorError
      }
      await this.pilot.call('setContentScriptType', 'pilot')
      await this.worker.call('setContentScriptType', 'worker')
      await this.pilot.call('ensureAuthenticated')

      this.setUserData(await this.pilot.call('getUserDataFromWebsite'))

      const ensureResult = await this.ensureAccountTriggerAndLaunch()
      await this.createTimeoutTrigger()
      if (ensureResult.createdAccount) {
        this.emit('CREATED_ACCOUNT', ensureResult.createdAccount)
      }
      if (ensureResult.createdJob) {
        this.emit('CREATED_JOB', ensureResult.createdJob)
      }
      await this.sendLoginSuccess()

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
      // to create the job even if the error was raised before sendLoginSuccess
      const ensureResult = await this.ensureAccountTriggerAndLaunch()
      if (ensureResult.createdAccount) {
        this.emit('CREATED_ACCOUNT', ensureResult.createdAccount)
      }
      if (ensureResult.createdJob) {
        this.emit('CREATED_JOB', ensureResult.createdJob)
      }
      await this.stop({ message: err.message })
    }
    this.emit('KONNECTOR_EXECUTION_END')
  }

  /**
   * Clean all remaining active objects when closing the connector
   * @returns {Promise<vod>}
   */
  async close() {
    this.controller.abort()
    this.removeTimeoutTrigger()
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
   * This method returns all cookies when asked by the running webview(s).
   * This method is callable by the content script.
   *
   * @param {String} options.cookieDomain : Domain's name where to get cookies from.
   * @return object | {null}
   */
  async getCookiesByDomain(cookieDomain) {
    const { manifest } = this.startContext
    if (manifest.cookie_domains === undefined) {
      throw new Error(
        'getCookiesByDomain cannot be called without cookie_domains declared in manifest'
      )
    }
    if (!manifest.cookie_domains.includes(cookieDomain)) {
      throw new Error(
        `Cookie domain ${cookieDomain} not declared in the manifest`
      )
    }
    try {
      const cookies = await CookieManager.get(cookieDomain)
      return cookies
    } catch (err) {
      throw new Error(`Error in worker: ${err.message}`)
    }
  }

  /**
   * This method returns a webView Cookie find by its name when asked by the running webview(s).
   * This method is callable by the content script.
   *
   * @param {String} cookieDomain : Domain to recover cookies from .
   * @param {String} cookieName : Name of the wanted cookie.
   * @return null | object
   */
  async getCookieByDomainAndName(cookieDomain, cookieName) {
    log.info('Starting getCookieByDomainAndName in RNLauncher')
    let expectedCookie = null
    try {
      const cookies = await this.getCookiesByDomain(cookieDomain)
      if (cookies[cookieName]) {
        expectedCookie = cookies[cookieName]
      }
      return expectedCookie
    } catch (err) {
      throw new Error(`Error in worker: ${err.message}`)
    }
  }

  /**
   * This method returns one cookie matching the provided name when asked by the running webview(s).
   * This method is callable by the content script.
   *
   * @param {String} options.cookieName : wanted cookie's by its name.
   * @return object | null
   */
  async getCookieFromKeychainByName(cookieName) {
    log.info('Starting getCookieFromKeychainByName in RNLauncher')
    try {
      const { account } = this.startContext
      const accountId = account.id
      const existingCookie = await getCookie({
        accountId,
        cookieName
      })
      if (existingCookie === null) {
        log.info(
          `No cookie named "${cookieName}" has been found, returning null`
        )
      }
      return existingCookie
    } catch (err) {
      throw new Error(
        `Error in worker during getCookieFromKeychainByName: ${err.message}`
      )
    }
  }

  /**
   * This method saves given cookie in the keychain when asked by the running webview(s).
   * This method is callable by the content script.
   *
   * @param {cookieObject.<Object>} : Object containing all the needed properties of the cookie.
   */
  async saveCookieToKeychain(cookieObject) {
    log.info('Starting saveCookieToKeychain in RNLauncher')
    try {
      const { account } = this.startContext
      const accountId = account.id
      const existingCookie = await getCookie({
        accountId,
        cookieName: cookieObject.name
      })
      if (existingCookie !== null) {
        await removeCookie(accountId, cookieObject.name)
      }
      await saveCookie({ accountId, cookieObject })
    } catch (err) {
      throw new Error(
        `Error in worker during saveCookieToKeychain: ${err.message}`
      )
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
