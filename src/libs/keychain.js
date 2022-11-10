import * as Keychain from 'react-native-keychain'

import Minilog from '@cozy/minilog'
// eslint-disable-next-line no-unused-vars
import { AccountsDoctype } from 'cozy-client/dist/types.js'

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
 *
 * @param {AccountsDoctype} account - io.cozy.accounts
 */
export async function saveCredential(account) {
  lockKeychain("saveCredential: You can't save while the keychain is locked")
  try {
    const passwords = await getDecodedGenericPasswords()
    const newJSON = addItem(
      { scope: CREDENTIALS_SCOPE, key: account._id, value: account },
      passwords
    )
    await Keychain.setGenericPassword(GLOBAL_KEY, JSON.stringify(newJSON))
  } finally {
    unlockKeychain('saveCredential is done')
  }
}
/**
 *
 * @param {AccountsDoctype} account - io.cozy.accounts
 * @returns {null|AccountsDoctype}
 */
export async function getCredential(account) {
  const password = await getDecodedGenericPasswords()
  const credentialsKeyChain = password[CREDENTIALS_SCOPE] || {}
  if (!credentialsKeyChain[account._id]) {
    return null
  }
  return credentialsKeyChain[account._id]
}
/**
 *
 * @param {AccountsDoctype} account
 */
export async function removeCredential(account) {
  lockKeychain(
    "removeCredential: You can't remove while the keychain is locked"
  )
  try {
    const passwords = await getDecodedGenericPasswords()
    const newJSON = removeItem(
      { scope: CREDENTIALS_SCOPE, key: account._id },
      passwords
    )
    await Keychain.setGenericPassword(GLOBAL_KEY, JSON.stringify(newJSON))
  } finally {
    unlockKeychain('removeCredential is done')
  }
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

function addItem({ scope, key, value }, existingJSON = {}) {
  const clonedJSON = { ...existingJSON }

  if (!clonedJSON[scope]) {
    clonedJSON[scope] = {}
  }
  if (clonedJSON[scope][key]) {
    throw new Error(
      `${key} is already saved in ${scope}. You can't add it again.`
    )
  }
  clonedJSON[scope][key] = value
  return clonedJSON
}

function addCookieItem({ scope, account, key, value }, existingJSON = {}) {
  const clonedJSON = { ...existingJSON }

  if (!clonedJSON[scope]) {
    clonedJSON[scope] = {}
  }
  if (!clonedJSON[scope][account]) {
    clonedJSON[scope][account] = {}
  }
  if (clonedJSON[scope][account][key]) {
    throw new Error(
      `${key} is already saved in ${scope}. You can't add it again.`
    )
  }
  clonedJSON[scope][account][key] = [value]
  return clonedJSON
}

function removeItem({ scope, key }, existingJSON = {}) {
  const clonedJSON = { ...existingJSON }
  if (!clonedJSON[scope]) {
    throw new Error(
      `removeItem: can't remove ${key} from ${scope} since ${scope} doesn't exist`
    )
  }
  if (!clonedJSON[scope][key]) {
    throw new Error(
      `removeItem: can't remove ${key} from ${scope}. ${key} is not there.`
    )
  }
  delete clonedJSON[scope][key]
  return clonedJSON
}

function removeCookieItem({ scope, account, key }, existingJSON = {}) {
  const clonedJSON = { ...existingJSON }
  if (!clonedJSON[scope]) {
    throw new Error(
      `removeCookieItem: can't remove ${key} from ${scope} since ${scope} doesn't exist`
    )
  }
  if (!clonedJSON[scope][account]) {
    throw new Error(
      `removeCookieItem: can't remove ${account} from ${scope}. ${account} is not there.`
    )
  }
  if (!clonedJSON[scope][account][key]) {
    throw new Error(
      `removeCookieItem: can't remove ${key} from ${account} in scope ${scope}. ${key} is not there.`
    )
  }
  delete clonedJSON[scope][account][key]
  return clonedJSON
}

export async function saveCookie(cookiesInfos) {
  lockKeychain("saveCookie: You can't save while the keychain is locked")
  try {
    const cookies = await getDecodedGenericPasswords()
    const newJSON = addCookieItem(
      {
        scope: COOKIES_SCOPE,
        account: cookiesInfos.accountId,
        key: cookiesInfos.konnectorSlug,
        value: cookiesInfos.cookieObject
      },
      cookies
    )
    await Keychain.setGenericPassword(GLOBAL_KEY, JSON.stringify(newJSON))
  } finally {
    unlockKeychain('saveCookie is done')
  }
}

export async function getCookie(cookieValue) {
  log.info('Starting getCookie in keychain')
  const cookie = await getDecodedGenericPasswords()
  const cookiesKeyChain = cookie[COOKIES_SCOPE] || {}
  if (!cookiesKeyChain[cookieValue.accountId]) {
    log.info('No matching accountId')
    return null
  }
  if (!cookiesKeyChain[cookieValue.accountId][cookieValue.konnectorSlug]) {
    log.info('No matching konnector slug')
    return null
  }
  const foundedCookies =
    cookiesKeyChain[cookieValue.accountId][cookieValue.konnectorSlug]
  if (cookieValue.cookieName) {
    for (let cookie of foundedCookies) {
      if (cookie.name === cookieValue.cookieName) {
        return cookie
      }
    }
  }
  for (let cookie of foundedCookies) {
    if (cookie.name === cookieValue.cookieObject.name) {
      return cookie
    }
  }
  log.info('No matching cookie returning null')
  return null
}

export async function removeCookie(account, slug) {
  lockKeychain("removeCookie: You can't remove while the keychain is locked")
  try {
    const passwords = await getDecodedGenericPasswords()
    const newJSON = removeCookieItem(
      { scope: COOKIES_SCOPE, account: account, key: slug },
      passwords
    )
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
  const currentGenerics = await Keychain.getGenericPassword()
  if (!currentGenerics) {
    return {}
  }
  const password = currentGenerics.password
    ? JSON.parse(currentGenerics.password)
    : {}
  return password
}
