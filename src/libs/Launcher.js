import {Q} from 'cozy-client'
import Minilog from '@cozy/minilog'

import {saveFiles, saveBills, saveIdentity} from './connectorLibs'
import {dataURItoArrayBuffer} from './utils'

const log = Minilog('Launcher')

/**
 * All launchers are supposed to implement this interface
 *
 * @interface
 */
export default class Launcher {
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
   * @returns {Bridge}
   */
  async start() {}

  /**
   * Get user unique identifier data, that the connector got after beeing authenticated
   *
   * @returns {UserData}
   */
  getUserData() {
    return this.userData
  }

  /**
   * Set user unique identifier data, that the connector got after beeing authenticated
   *
   * @param {UserData} data
   */
  setUserData(data) {
    this.userData = data
  }

  /**
   * startContext setter
   *
   * @param {LauncherStartContext} startContext
   */
  setStartContext(startContext) {
    this.startContext = startContext
  }

  /**
   * startContext getter
   *
   * @returns {LauncherStartContext}
   */
  getStartContext() {
    return this.startContext
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
   * Get content script logs. This function is called by the content script via the bridge
   *
   * @param  {ContentScriptLogMessage} message : log message
   */
  log(message) {
    Minilog('ContentScript').info(message)
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
}

/**
 * @typedef ContentScriptLogMessage
 * @property {string} level            : ( debug | info | warning | error | critical). Log level
 * @property {any} message             : message content
 * @property {string | null} label     : user defined label
 * @property {string | null} namespace : user defined namespace
 */

/**
 * @typedef LauncherStartContext
 * @property {CozyClient} client - CozyClient instance
 * @property {Object} manifest   - Manifest from the client side connector
 * @property {io.cozy.accounts} account
 * @property {io.cozy.triggers} trigger
 * @property {io.cozy.jobs}     job
 */

/**
 * @typedef UserData
 * @property {String} sourceAccountIdentifier - Unique string representing user's account. It may be user's email or name. This will be used to define the destination folder name and will be associated to each fetched data as metadata to assure it's unicity
 */
