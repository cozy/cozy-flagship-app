// @ts-check
/* eslint-disable no-unused-vars */
import Minilog from 'cozy-minilog'

import { getBuildId, getVersion } from 'react-native-device-info'

// @ts-ignore
import flag from 'cozy-flags'
import { Q, QueryDefinition, models } from 'cozy-client'
import { saveFiles, saveBills, saveIdentity } from 'cozy-clisk'

import { cleanExistingAccountsForKonnector } from './Launcher.functions'
import { getInstanceAndFqdnFromClient } from './client'
import {
  saveCredential,
  getCredential,
  removeCredential,
  getSlugAccountIds
} from './keychain'

import { constants } from '/screens/konnectors/constants/konnectors-constants'

const log = Minilog('Launcher')

export const TIMEOUT_KONNECTOR_ERROR = 'context deadline exceeded'

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
    this._firstFileSave = true
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
   * Start the konnector execution
   *
   * @returns {Promise<void>}
   */
  async start() {}

  /**
   * Get user unique identifier data, that the konnector got after beeing authenticated
   *
   * @returns {UserData|undefined}
   */
  getUserData() {
    return this.userData
  }

  /**
   * Set user unique identifier data, that the konnector got after beeing authenticated
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
    if (job) {
      return await client.save({
        ...job,
        attributes: {
          // @ts-ignore
          ...job.attributes,
          ...{ state, error }
        }
      })
    } else {
      log.info('Konnector execution stopped by user, no job to stop')
    }
  }

  /**
   * Save credentials for the current context
   *
   * @param {Object} credentials - any object containing credentials. Ex: {login: 'login', password: 'password'}
   * @returns {Promise<void>}
   */
  async saveCredentials(credentials) {
    const { konnector, client, account } = this.getStartContext()
    const existingCredentials = await this.getCredentials()
    if (existingCredentials) {
      await this.removeCredentials()
    }
    const result = {
      version: 1,
      _id: account._id,
      createdByAppVersion: getVersion() + '-' + (await getBuildId()),
      createdAt: new Date().toJSON(),
      slug: konnector.slug,
      credentials
    }
    const fqdn = getInstanceAndFqdnFromClient(client).normalizedFqdn
    await saveCredential(fqdn, result)
  }

  /**
   * Remove any existing credential for the current context
   *
   * @returns {Promise<void>}
   */
  async removeCredentials() {
    const { account, client } = this.getStartContext()
    const fqdn = getInstanceAndFqdnFromClient(client).normalizedFqdn
    await removeCredential(fqdn, account)
  }

  /**
   * Get saved credentials for the current context
   *
   * @returns {Promise<null|Object>}
   */
  async getCredentials() {
    const { account, client } = this.getStartContext()
    if (!account) {
      return null
    }
    const fqdn = getInstanceAndFqdnFromClient(client).normalizedFqdn
    const encAccount = await getCredential(fqdn, account)
    return encAccount?.credentials || null
  }

  /**
   * Try to find obsolete accounts in credentials which do not exist anymore in database and clean them
   *
   * @param {String} slug - konnector slug to check
   * @returns {Promise<Boolean>} - returns true if some accounts have been removed or else false
   */
  async cleanCredentialsAccounts(slug) {
    const { client } = this.getStartContext()
    const fqdn = getInstanceAndFqdnFromClient(client).normalizedFqdn
    const accountIds = await getSlugAccountIds(fqdn, slug)

    if (accountIds.length === 0) return false

    const { data: existingAccounts } = await client.query(
      Q('io.cozy.accounts').getByIds(accountIds)
    )
    const existingAccountIds = existingAccounts.map(
      (/** @type {{ _id: String; }} */ a) => a._id
    )
    let didRemoveAccountCredential = false
    for (const accountId of accountIds) {
      if (!existingAccountIds.includes(accountId)) {
        await removeCredential(fqdn, { _id: accountId })
        didRemoveAccountCredential = true
      }
    }
    return didRemoveAccountCredential
  }

  /**
   * Ensures that that the account has the proper account name which is the sourceAccountIdentifier fetched by the konnector
   *
   * @param {import('cozy-client/types/types').IOCozyAccount} account - cozy account
   * @returns {Promise<import('cozy-client/types/types').IOCozyAccount>}
   */
  async ensureAccountName(account) {
    const { client } = this.getStartContext()
    const { sourceAccountIdentifier } = this.getUserData() || {}
    if (!account._id) {
      throw new Error('ensureAccountName: no account to check')
    }

    let { data: accountGetResult } = await client.query(
      Q('io.cozy.accounts').getById(account._id)
    )
    if (accountGetResult?.auth?.accountName !== sourceAccountIdentifier) {
      log.debug('Will update account accountName to ', sourceAccountIdentifier)
      const { data: accountSaveResult } = await client.save({
        ...accountGetResult,
        auth: { accountName: sourceAccountIdentifier }
      })
      return accountSaveResult
    } else {
      return accountGetResult
    }
  }

  /**
   * @typedef ensureAccountTriggerAndLaunchResult
   * @property {import('cozy-client/types/types').IOCozyAccount} [createdAccount] - the created account if an account was created in the process
   * @property {import('cozy-client/types/types').IOCozyTrigger} [createdTrigger] - the created trigger if a trigger was created in the process
   * @property {import('cozy-client/types/types').CozyClientDocument} [createdJob] - the created job if any job was created
   */

  /**
   * Ensures that account and triggers are created and launch the trigger
   *
   * @returns {Promise<ensureAccountTriggerAndLaunchResult>}
   */
  async ensureAccountTriggerAndLaunch() {
    const result = {}
    const startContext = this.getStartContext()
    let {
      trigger,
      account,
      konnector,
      client,
      job,
      launcherClient,
      ...restOfContext
    } = startContext
    const { sourceAccountIdentifier } = this.getUserData() || {}

    if (!account) {
      log.debug(
        `ensureAccountAndTriggerAndLaunch: found no account in start context. Creating one`
      )

      await cleanExistingAccountsForKonnector(client, konnector.slug, log)

      const accountData = models.account.buildAccount(konnector, {})
      accountData._type = 'io.cozy.accounts'
      const accountResponse = await client.save(accountData)
      account = accountResponse.data
      log.debug(`ensureAccountAndTriggerAndJob: created account`, account)
      result.createdAccount = account
    }
    account = await this.ensureAccountName(account)
    // since we know the account, let's set it to the client used by the
    // konnector.
    launcherClient.setAppMetadata({
      sourceAccount: account._id
    })
    if (sourceAccountIdentifier) {
      launcherClient.setAppMetadata({
        sourceAccountIdentifier
      })
    }
    const folder = await models.konnectorFolder.ensureKonnectorFolder(client, {
      konnector: { ...konnector, _id: konnector.id }, // _id attribute is missing in konnector object, which causes the reference to the konnector in the destination folder to be null
      account,
      lang: client.getInstanceOptions().locale
    })
    if (!trigger) {
      log.debug(
        `ensureAccountAndTriggerAndJob: found no trigger in start context. Creating one`
      )
      const triggerData = models.trigger.triggers.buildTriggerAttributes({
        account,
        konnector,
        folder
      })
      triggerData._type = 'io.cozy.triggers'
      const triggerResponse = await client.save(triggerData)
      trigger = triggerResponse.data
      result.createdTrigger = trigger
      log.debug(`ensureAccountAndTriggerAndJob: created trigger`, trigger)
    } else if (trigger.message.folder_to_save !== folder._id) {
      this.log({
        level: 'debug',
        namespace: 'Launcher',
        label: 'ensureAccountTriggerAndLaunch',
        msg: 'Destination folder changed, updating the trigger'
      })

      const triggerUpdateResponse = await client.save({
        _type: 'io.cozy.triggers',
        _id: trigger._id,
        _rev: trigger._rev,
        message: {
          ...trigger.message,
          folder_to_save: folder._id
        }
      })
      trigger.message.folder_to_save =
        triggerUpdateResponse.data.message.folder_to_save
    }

    // trigger should not be already running (blocked in an upper level)
    // do not fail if the job is already created by harvest (on apps with not updated harvest)
    if (!job) {
      const launchResponse = await client
        .collection('io.cozy.triggers')
        .launch(trigger)
      job = launchResponse.data
      result.createdJob = job
    }
    log.debug(`ensureAccountAndTriggerAndJob: launched job`, job)
    this.setStartContext({
      client,
      account,
      trigger,
      job,
      konnector,
      launcherClient,
      ...restOfContext
    })
    return result
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
      konnector
    } = this.getStartContext() || {}
    const { sourceAccountIdentifier } = this.getUserData() || {}

    const existingFilesIndex = await this.getExistingFilesIndex(
      this.shouldResetFileIndex()
    )

    const result = await saveBills(entries, {
      ...options,
      client,
      manifest: konnector,
      // @ts-ignore
      sourceAccount: job.message.account,
      sourceAccountIdentifier,
      existingFilesIndex
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
   * Get the index of existing files for the current konnector and the current sourceAccountIdentifier
   * The result is cached in this.existingFilesIndex to optimize the response time for multiple calls to saveFiles
   *
   * @return {Promise<Map<String, import('cozy-client/types/types').FileDocument>>} - index of existing files
   */
  async getExistingFilesIndex(reset = false) {
    if (!reset && this.existingFilesIndex) {
      return this.existingFilesIndex
    }

    const { sourceAccountIdentifier } = this.getUserData() || {}
    const { konnector, client } = this.getStartContext()
    const createdByApp = konnector.slug
    if (!sourceAccountIdentifier) {
      throw new Error(
        'getExistingFilesIndex: unexpected undefined sourceAccountIdentifier'
      )
    }

    const existingFiles = await client.queryAll(
      Q('io.cozy.files')
        .where({
          trashed: false,
          cozyMetadata: {
            sourceAccountIdentifier,
            createdByApp
          }
        })
        .indexFields([
          'cozyMetadata.createdByApp',
          'cozyMetadata.sourceAccountIdentifier',
          'trashed'
        ])
        .select([
          'metadata',
          'cozyMetadata',
          'name',
          'dir_id',
          'size',
          'md5sum',
          'mime',
          'trashed'
        ])
    )
    // @ts-ignore
    const existingFilesIndex = existingFiles.reduce((map, file) => {
      if (file.metadata?.fileIdAttributes) {
        // files without metadata will be replaced
        map.set(file.metadata.fileIdAttributes, file)
      }
      return map
    }, new Map())
    return (this.existingFilesIndex = existingFilesIndex)
  }

  shouldResetFileIndex() {
    if (this._firstFileSave) {
      this._firstFileSave = false
      return false
    } else {
      return true
    }
  }

  /**
   * Save data in the current account's data attribute
   *
   * @param {Object} data - any object serializable with JSON.stringify
   * @returns <Promise<import('cozy-client/types/types').IOCozyAccount>>
   */
  async saveAccountData(data) {
    const { launcherClient: client, account } = this.getStartContext() || {}

    if (!account._id) {
      throw new Error('Launcher: No associated account. Cannot save account data yet')
    }

    const { data: currentAccount } = await client.query(
      Q('io.cozy.accounts').getById(account._id)
    )
    currentAccount.data = data
    const { data: newAccount } = await client.save(currentAccount)

    this.setStartContext({
      ...this.getStartContext(),
      account: newAccount
    })
    return newAccount
  }

  /**
   * Calls cozy-konnector-libs' saveFiles function
   *
   * @param {Array<FileDocument>} entries - list of file entries to save
   * @param {saveFilesOptions} options - options object
   * @returns {Promise<Array<object>>} list of saved files
   */
  async saveFiles(entries, options) {
    const {
      launcherClient: client,
      trigger,
      job,
      konnector
    } = this.getStartContext() || {}
    const { sourceAccountIdentifier } = this.getUserData() || {}

    const folderPath = await this.getFolderPath(trigger.message?.folder_to_save)

    const existingFilesIndex = await this.getExistingFilesIndex(
      this.shouldResetFileIndex()
    )

    const saveFilesOptions = {
      ...options,
      manifest: konnector,
      // @ts-ignore
      sourceAccount: job.message.account,
      sourceAccountIdentifier,
      // @ts-ignore
      downloadAndFormatFile: async entry => ({
        ...entry,
        // @ts-ignore
        dataUri: await this.worker.call('downloadFileInWorker', entry)
      }),
      existingFilesIndex,
      log: this.log.bind(this)
    }

    try {
      const result = await saveFiles(
        client,
        entries,
        folderPath,
        saveFilesOptions
      )
      log.debug(result, 'saveFiles result')
      return result
    } catch (err) {
      if (
        (err instanceof Error && err.message !== 'MAIN_FOLDER_REMOVED') ||
        !(err instanceof Error) // instanceof Error is here to fix typing error
      ) {
        throw err
      }
      // main destination folder has been removed during the execution of the konnector. Trying one time to reset all and relaunch saveFiles
      return await this.retrySaveFiles(entries, saveFilesOptions)
    }
  }

  /**
   * Rerun the saveFiles function after have reindexed files and created the destination folder
   * @param {Array<FileDocument>} entries - list of file entries to save
   * @param {object} options - options object
   * @returns {Promise<Array<object>>} list of saved files
   */
  async retrySaveFiles(entries, options) {
    const {
      launcherClient: client,
      account,
      trigger,
      konnector
    } = this.getStartContext() || {}

    const folderPath = await this.getFolderPath(trigger.message?.folder_to_save)
    this.log({
      level: 'warn',
      namespace: 'Launcher',
      label: 'saveFiles',
      msg: 'Destination folder removed during konnector execution, trying again'
    })
    const folder = await models.konnectorFolder.ensureKonnectorFolder(client, {
      konnector: { ...konnector, _id: konnector.id }, // _id attribute is missing in konnector object, which causes the reference to the konnector in the destination folder to be null
      account,
      lang: client.getInstanceOptions().locale
    })
    trigger.message.folder_to_save = folder._id
    const { data: triggerResult } = await client.save(trigger)

    this.setStartContext({
      ...this.getStartContext(),
      trigger: triggerResult
    })

    const updatedFilesIndex = await this.getExistingFilesIndex(true) // update files index since the destination folder was removed

    return await saveFiles(client, entries, folderPath, {
      ...options,
      existingFilesIndex: updatedFilesIndex
    })
  }

  /**
   * Fetch all documents according to given query definition
   *
   * @param {import('cozy-client').QueryDefinition} queryDefinition - object which can be passed to QueryDefinition constructor
   * @param {import('cozy-client/types/types').QueryOptions} options - query options
   * @returns {Promise<import('cozy-client/types/types').QueryResult>} - query result
   */
  async queryAll(queryDefinition, options) {
    const { launcherClient: client } = this.getStartContext() || {}

    // undefined is converted to null in post-me interface and null
    // is not supported by cozy-client
    const queryOption = options === null ? undefined : options
    return await client.queryAll(
      new QueryDefinition(queryDefinition),
      queryOption
    )
  }

  /**
   * Creates a trigger to launch a service from home application which will force the end of the current job with 'context deadline exceeded'
   * message after constants.serviceTimeoutDuration minutes
   *
   * @returns {Promise<void>}
   */
  async createTimeoutTrigger() {
    const { client, job } = this.getStartContext() || {}

    if (!job) {
      throw new Error('createTimeoutTrigger: no job found in context')
    }

    const { data: timeoutTrigger } = await client.save({
      _type: 'io.cozy.triggers',
      worker: 'service',
      type: '@in',
      arguments: constants.serviceTimeoutDuration,
      message: {
        slug: 'home',
        name: 'cliskTimeout',
        fields: {
          cliskJobId: job._id
        }
      }
    })
    this.setStartContext({
      ...this.getStartContext(),
      timeoutTrigger
    })
  }

  /**
   * Removes the timeout trigger when the job is already done
   *
   * @returns {Promise<void>}
   */
  async removeTimeoutTrigger() {
    const { client, timeoutTrigger } = this.getStartContext() || {}
    if (timeoutTrigger) {
      try {
        await client.destroy(timeoutTrigger)
      } catch (err) {
        // @ts-ignore
        if (err.status === 404) {
          log.warn(
            `The timeout trigger ${timeoutTrigger._id} does not exist anymore. Could not remove it`
          )
        } else throw err
      }
    }
  }
}

/**
 * @typedef ContentScriptLogMessage
 * @property {'debug'|'info'|'warn'|'error'|'critical'} level - Log level
 * @property {string} msg             - message content
 * @property {string | null} label     - user defined label
 * @property {string | null} namespace - user defined namespace
 * @property {String} [timestamp] - DateTime iso string when the log message was created
 */

/**
 * @typedef LauncherStartContext
 * @property {import('cozy-client').default} client - CozyClient instance
 * @property {import('cozy-client').default} launcherClient - CozyClient instance with konnector permissions
 * @property {import('cozy-client/types/types').IOCozyAccount}   account
 * @property {import('cozy-client/types/types').IOCozyTrigger}   trigger
 * @property {import('cozy-client/types/types').CozyClientDocument}       job
 * @property {import('cozy-client/types/types').IOCozyKonnector} konnector
 * @property {import('cozy-client/types/types').IOCozyTrigger} [timeoutTrigger]
 * @property {import('cozy-client/types/types').Manifest} manifest
 */

/**
 * @typedef UserData
 * @property {String|null} sourceAccountIdentifier - Unique string representing user's account. It may be user's email or name. This will be used to define the destination folder name and will be associated to each fetched data as metadata to assure it's unicity
 */

/**
 * @typedef FileDocument
 * @property {String} [dataUri]
 * @property {ArrayBuffer} [filestream]
 * @property {String} [fileurl]
 */

/**
 * @typedef saveFilesOptions
 * @property {string} sourceAccount - id of the associated cozy account
 * @property {string} sourceAccountIdentifier - unique identifier of the website account
 * @property {import('cozy-client/types/types').Manifest} manifest - name of the file
 * @property {Array<string>} fileIdAttributes - List of entry attributes considered as unique deduplication key
 * @property {string} [subPath] - subPath of the destination folder path where to put the downloaded file
 * @property {Function} [postProcess] - callback called after the file is download to further modify it
 * @property {string} [contentType] - will force the contentType of the file if any
 * @property {Function} [shouldReplaceFile] - Function which will define if the file should be replaced or not
 * @property {Function} [validateFile] - this function will check if the downloaded file is correct (by default, error if file size is 0)
 * @property {Function} [downloadAndFormatFile] - this callback will download the file and format to be useable by cozy-client
 * @property {string} [qualificationLabel] - qualification label defined in cozy-client which will be used on all given files
 * @property {number} [retry] - number of retries if the download of a file failes. No retry by default
 */

/**
 * @typedef InitOptions
 * @property {BridgeOptions} bridgeOptions - options which will be given as is to the bridge. Bridge options depend on the environment of the launcher
 * @property {string} contentScript - source code of the content script which will be injected
 */

/**
 * @typedef BridgeOptions
 * @property {import('react-native-webview').WebView} pilotWebView - pilot webview reference
 * @property {import('react-native-webview').WebView} workerWebview - worker webview reference
 */
