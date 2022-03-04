import * as Keychain from 'react-native-keychain'

import Minilog from '@cozy/minilog'
import {AccountsDoctype} from 'cozy-client/dist/types.js' //eslint-disable-line no-unused-vars

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
  const currentGenerics = await Keychain.getGenericPassword()
  const newJSON = addItem(
    {scope: CREDENTIALS_SCOPE, key: account._id, value: account},
    currentGenerics ? JSON.parse(currentGenerics.password) : {},
  )
  await Keychain.setGenericPassword(GLOBAL_KEY, JSON.stringify(newJSON))
  unlockKeychain('saveCredential is done')
}
/**
 *
 * @param {AccountsDoctype} account - io.cozy.accounts
 * @returns {null|AccountsDoctype}
 */
export async function getCredential(account) {
  const currentGenerics = await Keychain.getGenericPassword()
  if (!currentGenerics) {
    return null
  }
  const password = currentGenerics.password
    ? JSON.parse(currentGenerics.password)
    : {}
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
    "removeCredential: You can't remove while the keychain is locked",
  )
  const currentGenerics = await Keychain.getGenericPassword()
  const newJSON = removeItem(
    {scope: CREDENTIALS_SCOPE, key: account._id},
    currentGenerics ? JSON.parse(currentGenerics.password) : {},
  )
  await Keychain.setGenericPassword(GLOBAL_KEY, JSON.stringify(newJSON))
  unlockKeychain('removeCredential is done')
}
/**
 *
 * @param {String} key
 * @param {String|Object} value
 */
export async function saveVaultInformation(key, value) {
  lockKeychain(
    "saveVaultInformation: You can't save while the keychain is locked",
  )
  const currentGenerics = await Keychain.getGenericPassword()
  const newJSON = addItem(
    {scope: VAULT_SCOPE, key, value},
    currentGenerics ? JSON.parse(currentGenerics.password) : {},
  )
  await Keychain.setGenericPassword(GLOBAL_KEY, JSON.stringify(newJSON))
  unlockKeychain('saveVaultInformation is done')
}
/**
 *
 * @param {String} key
 * @returns {String|Object}
 */
export async function getVaultInformation(key) {
  const currentGenerics = await Keychain.getGenericPassword()
  const password = currentGenerics.password
    ? JSON.parse(currentGenerics.password)
    : {}
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
    "removeVaultInformation: You can't remove while the keychain is locked",
  )
  isLocked = true
  const currentGenerics = await Keychain.getGenericPassword()
  const newJSON = removeItem(
    {scope: VAULT_SCOPE, key: key},
    currentGenerics ? JSON.parse(currentGenerics.password) : {},
  )
  await Keychain.setGenericPassword(GLOBAL_KEY, JSON.stringify(newJSON))
  unlockKeychain('removeVaultInformation is done')
}

export async function deleteKeychain() {
  await Keychain.resetGenericPassword()
}

function addItem({scope, key, value}, existingJSON = {}) {
  const clonedJSON = {...existingJSON}

  if (!clonedJSON[scope]) {
    clonedJSON[scope] = {}
  }
  if (clonedJSON[scope][key]) {
    throw new Error(
      `${key} is already saved in ${scope}. You can't add it again.`,
    )
  }
  clonedJSON[scope][key] = value
  return clonedJSON
}

function removeItem({scope, key}, existingJSON = {}) {
  const clonedJSON = {...existingJSON}
  if (!clonedJSON[scope]) {
    throw new Error(
      `removeItem: can't remove ${key} from ${scope} since ${scope} doesn't exist`,
    )
  }
  if (!clonedJSON[scope][key]) {
    throw new Error(
      `removeItem: can't remove ${key} from ${scope}. ${key} is not there.`,
    )
  }
  delete clonedJSON[scope][key]
  return clonedJSON
}
