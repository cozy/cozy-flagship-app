import Minilog from 'cozy-minilog'

import CookieManager from '@react-native-cookies/cookies'
import debounce from 'lodash/debounce'
import MicroEE from 'microee'
import semverCompare from 'semver/functions/compare'

import Launcher from './Launcher'
import ContentScriptBridge from './bridge/ContentScriptBridge'

import { getKonnectorBundle } from '/libs/cozyAppBundle/cozyAppBundle.functions'

import { saveCookie, getCookie, removeCookie } from './keychain'

import { updateCozyAppBundle } from '/libs/cozyAppBundle/cozyAppBundle'
import { sendKonnectorsLogs } from '/libs/konnectors/sendKonnectorsLogs'

import { wrapTimerFactory } from 'cozy-clisk'

import {
  activateKeepAwake,
  deactivateKeepAwake
} from '/app/domain/sleep/services/sleep'

const log = Minilog('ReactNativeLauncher')

const SET_WORKER_STATE_TIMEOUT_MS = 30 * 1000

export const ERRORS = {
  SET_WORKER_STATE_TOO_LONG_TO_INIT:
    'ReactNativeLauncher.setWorkerState took more than 30000 ms'
}

Minilog.enable()

function LauncherEvent() {}

MicroEE.mixin(LauncherEvent)

const MIN_CLISK_SUPPORTED_VERSION = '0.10.0'

export const launcherEvent = new LauncherEvent()

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
    this.workerListenedEventsNames = ['log', 'workerEvent']

    this.controller = new AbortController()

    const wrapTimer = wrapTimerFactory({
      logFn: msg => this.log({ level: 'info', msg })
    })

    this.getExistingFilesIndex = wrapTimer(this, 'getExistingFilesIndex')
    this.queryAll = wrapTimer(this, 'queryAll')
    this.init = wrapTimer(this, 'init', {
      displayName: 'pilot and worker init'
    })
    this.ensureKonnectorIsInstalled = wrapTimer(
      this,
      'ensureKonnectorIsInstalled'
    )
    this.restartWorkerConnection = wrapTimer(this, 'restartWorkerConnection')
    this.waitForWorkerEvent = wrapTimer(this, 'waitForWorkerEvent', {
      suffixFn: args => args?.[0]
    })
    this.waitForWorkerVisible = wrapTimer(this, 'waitForWorkerVisible')
    this.ensureAccountName = wrapTimer(this, 'ensureAccountName')
    this.ensureAccountTriggerAndLaunch = wrapTimer(
      this,
      'ensureAccountTriggerAndLaunch'
    )
    this.onWorkerWillReload = debounce(this.onWorkerWillReload.bind(this))
  }

  /**
   * Set konnector logger
   *
   * @param {Function} onKonnectorLog - konnector logger
   */
  setLogger(onKonnectorLog) {
    this.logger = onKonnectorLog
  }

  /**
   * Receive content script logs. This function is called by the content script via the bridge
   *
   * @param  {ContentScriptLogMessage} message - log message
   */
  log({ timestamp, ...logContent }) {
    const context = this.getStartContext()
    const slug = context.konnector.slug // konnector attribute is available before manifest one
    let jobId
    if (context.job) {
      jobId = context.job.id
    }
    this.logger({
      ...logContent,
      slug,
      jobId,
      timestamp: timestamp ?? new Date().toISOString()
    })
  }

  async init({ bridgeOptions, contentScript }) {
    const promises = [
      this.initPilotContentScriptBridge({
        webViewRef: bridgeOptions.pilotWebView,
        contentScript,
        exposedMethodsNames: [
          'setWorkerState',
          'blockWorkerInteractions',
          'unblockWorkerInteractions',
          'runInWorker',
          'saveFiles',
          'saveBills',
          'saveIdentity',
          'queryAll',
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

    // we subscribe to this event only once both bridges are initialized or else we will
    // receive this event also for the first worker page load
    this.on('NEW_WORKER_INITIALIZING', webviewRef =>
      this.onWorkerWillReload(webviewRef)
    )
  }

  /**
   * Make sur that the konnector is correctly installed
   *
   * @param {object} options - options object
   * @param {String} options.slug - konnector slug
   * @param {import('cozy-client').default} options.client - CozyClient instance
   * @returns {getKonnectorBundle}
   */
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
        The konnector will not be able to run: ${error.message}`
      )
    }
  }

  /**
   * Finish the execution of the konnector. Sending logs and update current job state
   *
   * @param {object} options - options object
   * @param {String} [options.message] - options object
   * @returns {Promise<void>}
   */
  async stop({ message } = {}) {
    deactivateKeepAwake('clisk')
    const { client, job } = this.getStartContext()

    if (message) {
      this.log({ level: 'error', message })
    }
    await sendKonnectorsLogs(client)
    if (job) {
      launcherEvent.emit('launchResult', { cancel: true })
      if (message) {
        await this.updateJobResult({
          state: 'errored',
          error: message
        })
      } else {
        await this.updateJobResult()
      }
      this.emit('STOPPED_JOB')
    } else {
      launcherEvent.emit('launchResult', { errorMessage: message })
    }
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
    activateKeepAwake('clisk')
    const { account: prevAccount, konnector } = this.getStartContext()
    try {
      if (initKonnectorError) {
        log.info('Got initKonnectorError ' + initKonnectorError.message)
        throw initKonnectorError
      }
      await this.pilot.call('setContentScriptType', 'pilot')
      await this.worker.call('setContentScriptType', 'worker')
      const shouldLogout = await this.cleanCredentialsAccounts(konnector.slug)
      if (shouldLogout) {
        log(
          'info',
          `Detected removed account: first ensure webview is not authenticated`
        )
        const cliskVersion = await this.pilot.call('getCliskVersion')
        if (semverCompare(cliskVersion, MIN_CLISK_SUPPORTED_VERSION) === -1) {
          log(
            'warn',
            `The cozy-clisk version of this konnector is too low: ${cliskVersion}. ${MIN_CLISK_SUPPORTED_VERSION} version should be used to be able to call ensureNotAuthenticated`
          )
        } else {
          await this.pilot.call('ensureNotAuthenticated')
        }
      }
      await this.pilot.call('ensureAuthenticated', { account: prevAccount })

      this.setUserData(await this.pilot.call('getUserDataFromWebsite'))

      const ensureResult = await this.ensureAccountTriggerAndLaunch()
      await this.createTimeoutTrigger()
      if (ensureResult.createdAccount) {
        this.emit('CREATED_ACCOUNT', ensureResult.createdAccount)
      }
      if (ensureResult.createdJob) {
        this.emit('CREATED_JOB', ensureResult.createdJob)
      }

      launcherEvent.emit('loginSuccess', ensureResult.createdAccount?._id)

      const { account, trigger, job, manifest } = this.getStartContext()
      const { sourceAccountIdentifier } = this.getUserData()

      const pilotContext = {
        manifest,
        account,
        trigger,
        job,
        sourceAccountIdentifier
      }
      await this.pilot.call('fetch', pilotContext)
      await this.stop()
    } catch (err) {
      log.error(err, 'start error')
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
  setWorkerState(options) {
    return new Promise((resolve, reject) => {
      let timerId = null

      this.once('worker:webview:ready', () => {
        clearTimeout(timerId)
        if (options?.visible === true) {
          this.emit('worker:visible')
        }
        resolve()
      })
      timerId = setTimeout(() => {
        reject(ERRORS.SET_WORKER_STATE_TOO_LONG_TO_INIT)
      }, options?.timeout || SET_WORKER_STATE_TIMEOUT_MS)
      this.emit('SET_WORKER_STATE', options)
    })
  }

  async blockWorkerInteractions() {
    this.emit('BLOCK_WORKER_INTERACTIONS')
  }

  async unblockWorkerInteractions() {
    this.emit('UNBLOCK_WORKER_INTERACTIONS')
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
    try {
      return await new Promise((resolve, reject) => {
        this.once('WORKER_WILL_RELOAD', () => {
          // we need to reject once the worker is back and ready.
          // This way, the pilot can call the worker one more time
          // and be sure it is ready
          this.once('WORKER_RELOADED', () => {
            reject(new Error('WORKER_RELOADED'))
          })
        })
        // eslint-disable-next-line promise/catch-or-return
        this.worker
          .call(method, ...args)
          .then(resolve)
          .catch(err => reject(err))
      })
    } catch (err) {
      if (err.message !== 'WORKER_RELOADED') {
        throw err
      }
      return false
    }
  }

  /**
   * send any data from the worker to the pilot to allow the pilot to store this data between worker navigations
   *
   * @param {*} obj
   */
  async sendToPilot(obj) {
    await this.pilot.call('storeFromWorker', obj)
  }

  /**
   * Resolve when a given event on the worker page has occured. This allow to measure the time between the initialization of the worker and this event
   *
   * @param {*} event - event name
   * @returns {Promise<void>}
   */
  async waitForWorkerEvent(event) {
    return new Promise(resolve => {
      this.once(`worker:${event}`, () => {
        resolve()
      })
    })
  }

  /**
   * Resolve when the worker is made visible by the pilot. This allow to measure the time between the initialization of the worker and this event
   * @param {Function} [callback] - Optional callback to call when the worker is visible
   * @returns {Promise<void>}
   */
  async waitForWorkerVisible(callback) {
    return new Promise(resolve => {
      this.once('worker:visible', () => {
        callback?.()
        resolve()
      })
    })
  }

  /**
   * Reestablish the connection between launcher and the worker after a web page reload
   */
  async restartWorkerConnection(webViewRef) {
    log.info('restarting worker')
    this.waitForWorkerEvent('load') // not awaited on purpose to make the restart the fastest possible
    this.waitForWorkerEvent('DOMContentLoaded') // not awaited on purpose to make the restart the fastest possible

    try {
      await this.worker.close()
      await this.worker.init({
        webViewRef,
        exposedMethodsNames: this.workerMethodNames,
        listenedEventsNames: this.workerListenedEventsNames,
        label: 'launcher => worker'
      })
      await this.worker.call('setContentScriptType', 'worker')
    } catch (err) {
      throw new Error(`worker bridge restart init error: ${err.message}`)
    }
    this.emit('WORKER_RELOADED')
    this.emit('worker:webview:ready')
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
    this.pilot = new ContentScriptBridge({ label: 'launcher => pilot' })
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
    this.worker = new ContentScriptBridge({ label: 'launcher => worker' })
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
   * Relay between the pilot webview and the bridge to allow the bridge to work
   */
  onPilotMessage(event) {
    if (this.pilot) {
      this.pilot.messenger.onMessage.apply(this.pilot.messenger, [event])
    }
  }

  /**
   * Relay between the worker webview and the bridge to allow the bridge to work
   */
  onWorkerMessage(event) {
    if (this.worker) {
      this.worker.messenger.onMessage.apply(this.worker.messenger, [event])
    }
  }

  /**
   * Actions to do before the worker reloads : restart the connection
   *
   * @param {Object} webViewRef - reference to the worker webview
   */
  async onWorkerWillReload(webViewRef) {
    this.emit('WORKER_WILL_RELOAD')
    try {
      await this.restartWorkerConnection(webViewRef)
    } catch (err) {
      log.error('Error while reloading the worker', err)
    }
  }
}

MicroEE.mixin(ReactNativeLauncher)
export default ReactNativeLauncher
