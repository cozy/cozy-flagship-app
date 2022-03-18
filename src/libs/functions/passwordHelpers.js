import Minilog from '@cozy/minilog'

import {queryResultToCrypto} from '../../components/webviews/CryptoWebView/cryptoObservable/cryptoObservable'

const log = Minilog('passwordHelpers')

const DEFAULT_ITERATION_NUMBER = 100000

const getSaltForInstance = instance => {
  const domain = instance.split(':')[0]
  const salt = `me@${domain}`

  return salt
}

/**
 * Hash password data by calling CryptioWebView cryptography methods
 *
 * @param {PasswordData} passwordData - the password data to hash
 * @param {string} instance - the Cozy instance used to generate the salt
 * @param {number} kdfIterations - the number of KDF iterations to be used for hashing the password
 * @returns {LoginData} login data containing hashed password and encryption keys
 * @throws
 */
export const doHashPassword = async (
  passwordData,
  fqdn,
  kdfIterations = DEFAULT_ITERATION_NUMBER,
) => {
  log.debug('Start hashing password')
  try {
    const {password, hint} = passwordData

    const salt = getSaltForInstance(fqdn)

    const result = await queryResultToCrypto('computePass', {
      pass: password,
      salt: salt,
      iterations: kdfIterations,
    })

    const {passwordHash, iterations, key, publicKey, privateKey, masterKey} =
      result.param

    const loginData = {
      passwordHash,
      hint,
      iterations,
      key,
      publicKey,
      privateKey,
      masterKey,
    }

    return loginData
  } catch (e) {
    log.error('Error while requesting cryptography result:', e.message)
    throw e
  }
}
