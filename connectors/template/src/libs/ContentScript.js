import LauncherBridge from './bridge/LauncherBridge'
import Minilog from '@cozy/minilog'

const log = Minilog('ContentScript class')

export default class ContentScript {
  /**
   * Init the bridge communication with the launcher.
   * It also exposes the methods which will be callable by the launcher
   */
  async init() {
    this.bridge = new LauncherBridge({localWindow: window})
    const exposedMethodsNames = [
      'ensureAuthenticated',
      'getUserDataFromWebsite',
      'fetch',
    ]
    const exposedMethods = {}
    // TODO error handling
    // should catch and call onError on the launcher to let it handle the job update
    for (const method of exposedMethodsNames) {
      exposedMethods[method] = this[method].bind(this)
    }
    await this.bridge.init({exposedMethods})
    window.onbeforeunload = () =>
      this.log(
        'window.beforeunload detected with previous url : ' + document.location,
      )
  }

  /**
   * Wait for a specific event from the worker and then resolve the promise
   *
   * @param {String} method : name of the method to run
   */
  async runInWorkerUntilTrue(method) {
    log('runInWorkerUntilTrue', method)
    let result = false
    while (!result) {
      log('runInWorker call', method)
      result = await this.bridge.call('runInWorker', method)
      log('runInWorker result', result)
    }
    return result
  }

  /**
   * Send log message to the launcher
   *
   * @param {string} : the log message
   * @todo Use cozy-logger to add logging level and other features
   */
  log(message) {
    this.bridge.emit('log', message)
  }

  /**
   * Make sur that the connector is authenticated to the website.
   * If not, show the login webview to the user to let her/him authenticated.
   * Resolve the promise when authenticated
   *
   * @throws LOGIN_FAILED
   * @returns void
   */
  async ensureAuthenticated() {
    return true
  }

  /**
   * Returns whatever unique information on the authenticated user which will be usefull
   * to identify fetched data : destination folder name, fetched data metadata
   *
   * @returns {Object}
   */
  async getUserDataFromWebsite() {}

  /**
   * Main function, fetches all connector data and save it to the cozy
   *
   * @param {Object} options.context : all the data already fetched by the connector in a previous execution. Will be usefull to optimize
   * connector execution by not fetching data we already have.
   * @returns {Object} : Connector execution result. TBD
   */
  async fetch({context}) {}
}
