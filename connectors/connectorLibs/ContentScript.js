import LauncherBridge from './bridge/LauncherBridge'
import Minilog from '@cozy/minilog'
import {kyScraper as ky, blobToBase64} from './utils'
import get from 'lodash/get'

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
      'checkAuthenticated',
      'waitForAuthenticated',
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
   * This method is made to run in the worker and will resolve only when
   * the user is authenticated
   *
   * @returns Promise.<Boolean>
   */
  async waitForAuthenticated() {
    let result = false
    while (result === false) {
      result = await this.checkAuthenticated()
      await sleep(1000)
    }
    return result
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
   * Bridge to the saveFiles method from the launcher.
   * - it prefilters files according to the context comming from the launcher
   * - download files when not filtered out
   * - converts blob files to base64 uri to be serializable
   *
   * @param {Array} entries : list of file entries to save
   * @param {Object} options : saveFiles options
   */
  async saveFiles(entries, options) {
    log.debug(entries, 'saveFiles input entries')
    const context = options.context
    log.debug(context, 'saveFiles input context')

    const filteredEntries = this.filterOutExistingFiles(entries, options)
    for (const entry of filteredEntries) {
      if (entry.fileurl) {
        entry.blob = await ky.get(entry.fileurl).blob()
        delete entry.fileurl
      }
      if (entry.blob) {
        // TODO paralelize
        entry.dataUri = await blobToBase64(entry.blob)
        delete entry.blob
      }
    }
    return await this.bridge.call('saveFiles', entries, options)
  }

  /**
   * Bridge to the saveBills method from the launcher.
   * - it first saves the files
   * - then saves bills linked to corresponding files
   *
   * @param {Array} entries : list of file entries to save
   * @param {Object} options : saveFiles options
   */
  async saveBills(entries, options) {
    const files = await this.saveFiles(entries, options)
    return await this.bridge.call('saveBills', files, options)
  }

  /**
   * Do not download files which already exist
   *
   * @param {Array} files
   * @param {Array<String>} options.fileIdAttributes: list of attributes defining the unicity of the file
   * @param {Object} options.context: current launcher context
   * @returns Array
   */
  filterOutExistingFiles(files, options) {
    if (options.fileIdAttributes) {
      const contextFilesIndex = this.createContextFilesIndex(
        options.context,
        options.fileIdAttributes,
      )
      return files.filter(
        (file) =>
          contextFilesIndex[
            this.calculateFileKey(file, options.fileIdAttributes)
          ] === undefined,
      )
    } else {
      return files
    }
  }

  /**
   * Creates an index of files, indexed by uniq id defined by fileIdAttributes
   *
   * @param {Object} context
   * @param {Array<String>} fileIdAttributes: list of attributes defining the unicity of a file
   * @returns Object
   */
  createContextFilesIndex(context, fileIdAttributes) {
    log.debug('getContextFilesIndex', context, fileIdAttributes)
    let index = {}
    for (const entry of context) {
      index[entry.metadata.fileIdAttributes] = entry
    }
    return index
  }

  /**
   * Calculates the key defining the uniqueness of a given file
   *
   * @param {Object} file
   * @param {Array<String>} fileIdAttributes: list of attributes defining the unicity of a file
   * @returns String
   */
  calculateFileKey(file, fileIdAttributes) {
    return fileIdAttributes
      .sort()
      .map((key) => get(file, key))
      .join('####')
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
