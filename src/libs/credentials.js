import Minilog from '@cozy/minilog'
const log = Minilog('credentials')

const CREDENTIALS_KEY = 'credentials'

/**
 * Save credentials in the account in the current launcher context if any
 * This is temporary.
 *
 * @param {LauncherStartContext} context
 * @returns {Promise<Object>}
 */
export async function saveCredentials(credentials, {client, account}) {
  account[CREDENTIALS_KEY] = credentials
  try {
    await client.save(account)
  } catch (err) {
    log.error('Could not save credentials: ' + err.message)
  }
  return credentials
}

/**
 * Get credentials in the account in the current launcher context if any
 * This is temporary.
 *
 * @param {LauncherStartContext} context
 * @returns {Promise<Object>}
 */
export async function getCredentials({account}) {
  return account[CREDENTIALS_KEY]
}
