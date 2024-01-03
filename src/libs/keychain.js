import * as Keychain from 'react-native-keychain'

// eslint-disable-next-line no-unused-vars
import { AccountsDoctype } from 'cozy-client/dist/types'
import Minilog from 'cozy-minilog'

const log = Minilog('Keychain')

Minilog.enable()

/*
Keychain's Structure
  JSON: {
      'VAULT': {encrypted_key: '1234' , 'pkdfitertation': 1000...}
      'CSC_ACCOUNTS': {
          _idAccount: {
              ....
          }
      }
  }
  */
export const CREDENTIALS_SCOPE = 'CSC_ACCOUNTS'
export const COOKIES_SCOPE = 'CSC_COOKIES'
export const VAULT_SCOPE = 'VAULT'
export const GLOBAL_KEY = 'secure'
let isLocked = false

/**
 *
 * @param {String} reason
 */
function lockKeychain(reason) {
  if (isLocked) {
    throw new Error(reason)
  }
  log.debug(`lock keychain: ${reason}`)
  isLocked = true
}
/**
 *
 * @param {String} reason
 */
function unlockKeychain(reason) {
  if (!isLocked) {
    log.warn('trying to unlock but keychain is not locked')
  }
  log.debug(`unlock keychain: ${reason}`)
  isLocked = false
}
/**
 * Save a given credential in the keychain
 *
 * @param {String} fqdn - current cozy fqdn
 * @param {AccountsDoctype} account - io.cozy.accounts
 */
export async function saveCredential(fqdn, account) {
  lockKeychain("saveCredential: You can't save while the keychain is locked")
  try {
    const passwords = await getDecodedGenericPasswords()
    const newJSON = addItem(
      {
        scope: CREDENTIALS_SCOPE,
        fqdn,
        key: account._id,
        value: account
      },
      passwords
    )
    await Keychain.setGenericPassword(GLOBAL_KEY, JSON.stringify(newJSON))
  } finally {
    unlockKeychain('saveCredential is done')
  }
}
/**
 *
 * @param {String} fqdn - current cozy fqdn
 * @param {AccountsDoctype} account - io.cozy.accounts
 * @returns {null|AccountsDoctype}
 */
export async function getCredential(fqdn, account) {
  const password = await getDecodedGenericPasswords()
  const credentialsKeyChain = password[CREDENTIALS_SCOPE]?.[fqdn] || {}
  if (!credentialsKeyChain[account._id]) {
    return null
  }
  return credentialsKeyChain[account._id]
}
/**
 *
 * @param {String} fqdn - current cozy fqdn
 * @param {AccountsDoctype} account
 */
export async function removeCredential(fqdn, account) {
  lockKeychain(
    "removeCredential: You can't remove while the keychain is locked"
  )
  try {
    const passwords = await getDecodedGenericPasswords()
    const newJSON = removeItem(
      { fqdn, scope: CREDENTIALS_SCOPE, key: account._id },
      passwords
    )
    await Keychain.setGenericPassword(GLOBAL_KEY, JSON.stringify(newJSON))
  } finally {
    unlockKeychain('removeCredential is done')
  }
}

/**
 * Get account ids associated to the given slug in keychain
 *
 * @param {String} fqdn - current cozy fqdn
 * @param {String} slug - konnector slug
 * @returns {Promise<Array<String>>} - list of account ids associated to the given slug
 */
export async function getSlugAccountIds(fqdn, slug) {
  const password = await getDecodedGenericPasswords()
  const credentials = password[CREDENTIALS_SCOPE]?.[fqdn] || {}
  const result = []
  for (const accountId in credentials) {
    const account = credentials[accountId]
    if (account.slug === slug) {
      result.push(accountId)
    }
  }
  return result
}

/**
 *
 * @param {String} key
 * @param {String|Object} value
 */
export async function saveVaultInformation(key, value) {
  lockKeychain(
    "saveVaultInformation: You can't save while the keychain is locked"
  )
  try {
    const passwords = await getDecodedGenericPasswords()
    const newJSON = addItem({ scope: VAULT_SCOPE, key, value }, passwords)
    await Keychain.setGenericPassword(GLOBAL_KEY, JSON.stringify(newJSON))
  } finally {
    unlockKeychain('saveVaultInformation is done')
  }
}
/**
 *
 * @param {String} key
 * @returns {Promise<String|Object>}
 */
export async function getVaultInformation(key) {
  const password = await getDecodedGenericPasswords()
  const vaultKeyChain = password[VAULT_SCOPE] || {}
  if (!vaultKeyChain[key]) {
    return null
  }
  return vaultKeyChain[key]
}
/**
 *
 * @param {String} key
 */
export async function removeVaultInformation(key) {
  lockKeychain(
    "removeVaultInformation: You can't remove while the keychain is locked"
  )
  try {
    const passwords = await getDecodedGenericPasswords()
    const newJSON = removeItem({ scope: VAULT_SCOPE, key: key }, passwords)
    await Keychain.setGenericPassword(GLOBAL_KEY, JSON.stringify(newJSON))
  } finally {
    unlockKeychain('removeVaultInformation is done')
  }
}

export async function deleteKeychain() {
  await Keychain.resetGenericPassword()
}

/**
 * Add an item to the keychain
 *
 * @param {Object} options - options object
 * @param {String} options.scope - keychain scope string
 * @param {String} [options.fqdn] - current cozy fqdn
 * @param {String} options.key - unique key associated to the item to add
 * @param {Object} existingJSON - current keychain json value
 * @returns {Object}
 */
function addItem({ scope, fqdn, key, value }, existingJSON = {}) {
  const clonedJSON = { ...existingJSON }

  if (!clonedJSON[scope]) {
    clonedJSON[scope] = {}
  }
  if (fqdn) {
    if (!clonedJSON[scope][fqdn]) {
      clonedJSON[scope][fqdn] = {}
    }
    if (clonedJSON[scope][fqdn][key]) {
      throw new Error(
        `${key} is already saved in ${scope}. You can't add it again.`
      )
    }
    clonedJSON[scope][fqdn][key] = value
  } else {
    if (clonedJSON[scope][key]) {
      throw new Error(
        `${key} is already saved in ${scope}. You can't add it again.`
      )
    }
    clonedJSON[scope][key] = value
  }
  return clonedJSON
}

function addCookieItem({ accountId, cookieObject }, existingJSON = {}) {
  const clonedJSON = { ...existingJSON }
  const scope = COOKIES_SCOPE
  if (!clonedJSON[scope]) {
    clonedJSON[scope] = {}
  }
  if (!clonedJSON[scope][accountId]) {
    clonedJSON[scope][accountId] = []
  }
  if (
    clonedJSON[scope][accountId].find(
      cookie => cookie.name === cookieObject.name
    )
  ) {
    throw new Error(
      `Cookie ${cookieObject.name} is already saved in ${accountId}. You can't add it again.`
    )
  }
  clonedJSON[scope][accountId].push(cookieObject)
  return clonedJSON
}

/**
 * Remove an item from the keychain
 *
 * @param {Object} options - options object
 * @param {String} options.scope - keychain scope string
 * @param {String} [options.fqdn] - current cozy fqdn
 * @param {String} options.key - unique key associated to the item to add
 * @param {Object} existingJSON - current keychain json value
 * @returns {Object}
 */
function removeItem({ fqdn, scope, key }, existingJSON = {}) {
  const clonedJSON = { ...existingJSON }
  if (!clonedJSON[scope]) {
    throw new Error(
      `removeItem: can't remove ${key} from ${scope} since ${scope} doesn't exist`
    )
  }
  if (fqdn) {
    if (!clonedJSON[scope][fqdn]) {
      throw new Error(
        `removeItem: can't remove ${key} from ${scope}.${fqdn}. ${fqdn} is not there.`
      )
    }
    if (!clonedJSON[scope][fqdn][key]) {
      throw new Error(
        `removeItem: can't remove ${key} from ${scope}.${fqdn}. ${key} is not there.`
      )
    }
    delete clonedJSON[scope][fqdn][key]
  } else {
    if (!clonedJSON[scope][key]) {
      throw new Error(
        `removeItem: can't remove ${key} from ${scope}. ${key} is not there.`
      )
    }
    delete clonedJSON[scope][key]
  }
  return clonedJSON
}

function removeCookieItem({ accountId, cookieName }, existingJSON = {}) {
  const clonedJSON = { ...existingJSON }
  const scope = COOKIES_SCOPE
  if (!clonedJSON[scope]) {
    log.warn(
      `removeCookieItem: can't remove ${accountId} from ${scope} since ${scope} doesn't exist`
    )
    return clonedJSON
  }
  if (!clonedJSON[scope][accountId]) {
    log.warn(
      `removeCookieItem: can't remove ${accountId} from ${scope}. ${accountId} is not there.`
    )
    return clonedJSON
  }
  if (
    !clonedJSON[scope][accountId].some(cookie => cookie.name === cookieName)
  ) {
    log.warn(
      `removeCookieItem: can't remove ${accountId} from ${scope}. ${accountId} is not there.`
    )
    return clonedJSON
  }
  clonedJSON[scope][accountId] = clonedJSON[scope][accountId].filter(
    cookie => cookie.name !== cookieName
  )
  return clonedJSON
}

export async function saveCookie(cookiesInfos) {
  lockKeychain("saveCookie: You can't save while the keychain is locked")
  try {
    const passwords = await getDecodedGenericPasswords()
    const newJSON = addCookieItem(
      {
        accountId: cookiesInfos.accountId,
        cookieObject: cookiesInfos.cookieObject
      },
      passwords
    )
    await Keychain.setGenericPassword(GLOBAL_KEY, JSON.stringify(newJSON))
  } finally {
    unlockKeychain('saveCookie is done')
  }
}

export async function getCookie({ accountId, cookieName }) {
  log.info('Starting getCookie in keychain')
  const passwords = await getDecodedGenericPasswords()
  const accounts = passwords[COOKIES_SCOPE] || {}
  const foundCookies = accounts[accountId]
  if (!foundCookies) {
    log.info('No matching accountId')
    return null
  }
  if (!cookieName) {
    throw new Error('getCookie cannot be called without a cookieName')
  }
  const result = foundCookies.find(cookie => cookie.name === cookieName)
  if (!result) {
    log.info('No matching cookie returning null')
    return null
  }
  return result
}

export async function removeCookie(accountId, cookieName) {
  lockKeychain("removeCookie: You can't remove while the keychain is locked")
  try {
    const passwords = await getDecodedGenericPasswords()
    const newJSON = removeCookieItem({ accountId, cookieName }, passwords)
    await Keychain.setGenericPassword(GLOBAL_KEY, JSON.stringify(newJSON))
  } finally {
    unlockKeychain('removeCookie is done')
  }
}
/**
 *
 * @returns {Object}
 */
async function getDecodedGenericPasswords() {
  try {
    const currentGenerics = await Keychain.getGenericPassword()
    if (!currentGenerics) {
      return {}
    }
    console.error('****currentGenerics', currentGenerics)
    const password = currentGenerics.password
      ? JSON.parse(currentGenerics.password)
      : {}
    return password
  } catch (error) {
    console.error('error getDecodedGenericPasswords', error)
  }
}
