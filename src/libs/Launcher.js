// @ts-check
/* eslint-disable no-unused-vars */
import { Q, models } from 'cozy-client'
import Minilog from '@cozy/minilog'
import get from 'lodash/get'
import set from 'lodash/set'
import { saveFiles, saveBills, saveIdentity } from 'cozy-clisk'

import { saveCredential, getCredential, removeCredential } from './keychain'
import { dataURItoArrayBuffer } from './utils'

const log = Minilog('Launcher')

/**
 * All launchers are supposed to implement this interface
 *
 * @interface
 */
export default class Launcher {
  constructor() {
    this.setUserData({
      sourceAccountIdentifier: null
    })
  }
  /**
   * Inject the content script and initialize the bridge to communicate it
   *
   * @param  {Object} options               - options object
   * @param  {Object} options.bridgeOptions - options which will be given as is to the bridge. Bridge options depend on the environment of the launcher
   * @param  {String} options.contentScript - source code of the content script which will be injected
   *
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async init({ bridgeOptions, contentScript }) {}

  /**
   * Start the connector execution
   *
   * @returns {Promise<void>}
   */
  async start() {}

  /**
   * Get user unique identifier data, that the connector got after beeing authenticated
   *
   * @returns {UserData|undefined}
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
    if (!this.startContext) {
      throw new Error('getStartContext should not be called before the start')
    }
    return this.startContext
  }

  /**
   * Updates the result of the current job
   *
   * @param {object} options         - options object
   * @param {String} options.state   - Final result of the job. Can be 'errored' or 'done'
   * @param {String} [options.error] - Job error message if any
   *
   * @returns {Promise<"io.cozy.jobs"|undefined>}
   */
  async updateJobResult({ state, error } = { state: 'done' }) {
    const { job, client } = this.getStartContext()
    return await client.save({
      ...job,
      attributes: {
        // @ts-ignore
        ...job.attributes,
        ...{ state, error }
      }
    })
  }

  /**
   * Save credentials for the current context
   *
   * @param {Object} credentials - any object containing credentials. Ex: {login: 'login', password: 'password'}
   * @returns {Promise<void>}
   */
  async saveCredentials(credentials) {
    const { account } = this.getStartContext()
    const existingCredentials = await this.getCredentials()
    if (existingCredentials) {
      await this.removeCredentials()
    }
    await saveCredential({ ...account, auth: credentials })
  }

  /**
   * Remove any existing credential for the current context
   *
   * @returns {Promise<void>}
   */
  async removeCredentials() {
    const { account } = this.getStartContext()
    await removeCredential(account)
  }

  /**
   * Get saved credentials for the current context
   *
   * @returns {Promise<null|Object>}
   */
  async getCredentials() {
    const { account } = this.getStartContext()
    const encAccount = await getCredential(account)
    return encAccount ? encAccount.auth : null
  }

  /**
   * Updates the account to send the LOGIN_SUCCESS message to harvest
   */
  async sendLoginSuccess() {
    const { account, client } = this.getStartContext()
    if (!account._id) {
      throw new Error('sendLoginSuccess: not account to update')
    }
    const updatedAccount = await client.query(
      Q('io.cozy.accounts').getById(account._id)
    )
    await client.save({
      ...updatedAccount.data,
      state: 'LOGIN_SUCCESS'
    })
  }

  /**
   * Ensure that the account and the destination folder get the name corresponding to sourceAccountIdentifier
   */
  async ensureAccountNameAndFolder() {
    const { trigger, account, client } = this.getStartContext()

    const firstRun = !get(account, 'auth.accountName')
    if (!firstRun) {
      return
    }

    const { sourceAccountIdentifier } = this.getUserData() || {}
    // @ts-ignore
    const folderId = trigger.message.folder_to_save

    if (!account._id) {
      throw new Error('ensureAccountNameAndFolder: no account to check')
    }

    log.info('This is the first run for this account')
    const updatedAccount = await client.query(
      Q('io.cozy.accounts').getById(account._id)
    )
    const newAccount = await client.save({
      ...updatedAccount.data,
      auth: { accountName: sourceAccountIdentifier }
    })
    log.debug(newAccount, 'resulting account')

    try {
      await client
        .collection('io.cozy.files')
        .updateAttributes(folderId, { name: sourceAccountIdentifier })
    } catch (err) {
      log.warn(
        `Could not rename the destination folder ${folderId} to ${sourceAccountIdentifier}. ${err}`
      )
    }
  }

  /**
   * Ensures that account and triggers are created and launch the trigger
   */
  async ensureAccountTriggerAndLaunch() {
    const startContext = this.getStartContext()
    let { trigger, account, connector, client, job, launcherClient } =
      startContext

    if (!account) {
      log.debug(
        `ensureAccountAndTriggerAndJob: found no account in start context. Creating one`
      )
      const accountData = models.account.buildAccount(connector, {})
      accountData._type = 'io.cozy.accounts'
      const accountResponse = await client.save(accountData)
      account = accountResponse.data
      log.debug(`ensureAccountAndTriggerAndJob: created account`, account)
    }
    if (!trigger) {
      log.debug(
        `ensureAccountAndTriggerAndJob: found no trigger in start context. Creating one`
      )
      const triggerData = models.trigger.triggers.buildTriggerAttributes({
        account,
        konnector: connector
      })
      triggerData._type = 'io.cozy.triggers'
      const triggerResponse = await client.save(triggerData)
      trigger = triggerResponse.data
      log.debug(`ensureAccountAndTriggerAndJob: created trigger`, trigger)
    }

    // trigger should not be already running (blocked in an upper level)
    // do not fail if the job is already created by harvest (on apps with not updated harvest)
    if (!job) {
      const launchResponse = await client
        .collection('io.cozy.triggers')
        .launch(trigger)
      job = launchResponse.data
    }
    log.debug(`ensureAccountAndTriggerAndJob: launched job`, job)

    this.setStartContext({
      client,
      account,
      trigger,
      job,
      connector,
      launcherClient
    })
  }

  /**
   * Get the folder path of any folder, given it's Id
   *
   * @param {String} folderId - Id of the folder
   *
   * @returns {Promise<String>} Folder path
   */
  async getFolderPath(folderId) {
    const { client } = this.getStartContext()
    const result = await client.query(Q('io.cozy.files').getById(folderId))
    return result.data.path
  }

  /**
   * Calls cozy-konnector-libs' saveBills function
   *
   * @param {Array<object>} entries  - list of file entries to save
   * @param {object} options - options object
   * @returns {Promise<Array<object>>} list of saved bills
   */
  async saveBills(entries, options) {
    log.debug(entries, 'saveBills entries')
    const {
      launcherClient: client,
      job,
      connector
    } = this.getStartContext() || {}
    const { sourceAccountIdentifier } = this.getUserData() || {}
    const result = await saveBills(entries, {
      ...options,
      client,
      manifest: connector,
      // @ts-ignore
      sourceAccount: job.message.account,
      sourceAccountIdentifier
    })
    return result
  }

  /**
   * Get content script logs. This function is called by the content script via the bridge
   *
   * @param  {ContentScriptLogMessage} message - log message
   */
  log(message) {
    Minilog('ContentScript').info(message)
  }

  /**
   * Calls cozy-konnector-libs' saveIdentifier function
   *
   * @param {Object} contact - contact object
   */
  async saveIdentity(contact) {
    const { launcherClient: client } = this.getStartContext()
    log.debug(contact, 'saveIdentity contact')
    const { sourceAccountIdentifier } = this.getUserData() || {}
    await saveIdentity(contact, sourceAccountIdentifier, { client })
  }

  /**
   * Calls cozy-konnector-libs' saveFiles function
   *
   * @param {Array<FileDocument>} entries - list of file entries to save
   * @param {object} options - options object
   * @param {String} options.qualificationLabel - file qualification label
   * @returns {Promise<Array<object>>} list of saved files
   */
  async saveFiles(entries, options) {
    const {
      launcherClient: client,
      trigger,
      job,
      connector
    } = this.getStartContext() || {}
    const { sourceAccountIdentifier } = this.getUserData() || {}
    for (const entry of entries) {
      if (entry.dataUri) {
        entry.filestream = dataURItoArrayBuffer(entry.dataUri).arrayBuffer
        delete entry.dataUri
      }
      if (options.qualificationLabel) {
        set(
          entry,
          'fileAttributes.metadata.qualification',
          models.document.Qualification.getByLabel(options.qualificationLabel)
        )
      }
    }
    log.info(entries, 'saveFiles entries')
    const result = await saveFiles(
      client,
      entries,
      // @ts-ignore
      await this.getFolderPath(trigger.message?.folder_to_save),
      {
        ...options,
        manifest: connector,
        // @ts-ignore
        sourceAccount: job.message.account,
        sourceAccountIdentifier
      }
    )
    log.info(result, 'saveFiles result')

    return result
  }

  /**
   * Fetches data already imported by the connector with the current sourceAccountIdentifier
   * This allows the connector to only fetch new data
   *
   * @param {object} options                         - options object
   * @param {String} options.sourceAccountIdentifier - current account unique identifier
   * @param {String} options.slug - connector slug
   * @returns {Promise<Object>}
   */
  async getPilotContext({ sourceAccountIdentifier, slug }) {
    const { launcherClient: client } = this.getStartContext()
    const result = await client.queryAll(
      Q('io.cozy.files')
        .where({
          trashed: false,
          cozyMetadata: {
            sourceAccountIdentifier,
            createdByApp: slug
          }
        })
        .indexFields([
          'trashed',
          'cozyMetadata.sourceAccountIdentifier',
          'cozyMetadata.createdByApp'
        ])
    )

    return result
  }
}

/**
 * @typedef ContentScriptLogMessage
 * @property {'debug'|'info'|'warning'|'error'|'critical'} level - Log level
 * @property {any} message             - message content
 * @property {string | null} label     - user defined label
 * @property {string | null} namespace - user defined namespace
 */

/**
 * @typedef LauncherStartContext
 * @property {import('cozy-client').default} client - CozyClient instance
 * @property {import('cozy-client').default} launcherClient - CozyClient instance with konnector permissions
 * @property {import('cozy-client/types/types').IOCozyAccount}   account
 * @property {import('cozy-client/types/types').IOCozyTrigger}   trigger
 * @property {import('cozy-client/types/types').CozyClientDocument}       job
 * @property {import('cozy-client/types/types').IOCozyKonnector} connector
 */

/**
 * @typedef UserData
 * @property {String|null} sourceAccountIdentifier - Unique string representing user's account. It may be user's email or name. This will be used to define the destination folder name and will be associated to each fetched data as metadata to assure it's unicity
 */

/**
 * @typedef FileDocument
 * @property {String} [dataUri]
 * @property {ArrayBuffer} filestream
 */
