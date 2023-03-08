// @ts-check
/* eslint-disable no-unused-vars */
import Minilog from '@cozy/minilog'
import set from 'lodash/set'

import { Q, models } from 'cozy-client'
import { saveFiles, saveBills, saveIdentity } from 'cozy-clisk'

import { ensureKonnectorFolder } from './folder'
import { saveCredential, getCredential, removeCredential } from './keychain'
import { dataURItoArrayBuffer } from './utils'

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
    if (!account) {
      return null
    }
    const encAccount = await getCredential(account)
    return encAccount ? encAccount.auth : null
  }

  /**
   * Updates the account to send the LOGIN_SUCCESS message to harvest
   */
  async sendLoginSuccess() {
    const { account, client } = this.getStartContext()
    if (!account?._id) {
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
   * Ensures that that the account has the proper account name which is the sourceAccountIdentifier fetched by the konnector
   *
   * @param {import('cozy-client/types/types').IOCozyAccount} account - cozy account
   * @returns {Promise<import('cozy-client/types/types').IOCozyAccount>}
   */
  async ensureAccountName(account) {
    const { client, konnector } = this.getStartContext()
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

    if (!account) {
      log.debug(
        `ensureAccountAndTriggerAndJob: found no account in start context. Creating one`
      )
      const accountData = models.account.buildAccount(konnector, {})
      accountData._type = 'io.cozy.accounts'
      const accountResponse = await client.save(accountData)
      account = accountResponse.data
      log.debug(`ensureAccountAndTriggerAndJob: created account`, account)
      result.createdAccount = account
    }
    account = await this.ensureAccountName(account)
    const folder = await ensureKonnectorFolder(client, {
      konnector,
      account
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
    const result = await saveBills(entries, {
      ...options,
      client,
      manifest: konnector,
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
      konnector
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
        manifest: konnector,
        // @ts-ignore
        sourceAccount: job.message.account,
        sourceAccountIdentifier
      }
    )
    log.info(result, 'saveFiles result')

    return result
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

  /**
   * Fetches data already imported by the konnector with the current sourceAccountIdentifier
   * This allows the konnector to only fetch new data
   *
   * @param {object} options                         - options object
   * @param {String} options.sourceAccountIdentifier - current account unique identifier
   * @param {String} options.slug - konnector slug
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
 * @property {import('cozy-client/types/types').IOCozyKonnector} konnector
 * @property {import('cozy-client/types/types').IOCozyTrigger} [timeoutTrigger]
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
