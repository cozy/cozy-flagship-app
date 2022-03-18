/***************************************************************************/
/* This code should reflect cozy-stack/assets/scripts/password-helpers.js */
/***************************************************************************/

// Return given password strength as an object {percentage, label}
const getStrength = `
  function getStrength(password) {
    if (!password && password !== '') {
      throw new Error('password parameter is missing')
    }
    if (!password.length) {
      return { percentage: 0, label: 'weak' }
    }

    const charsets = [
      // upper
      { regexp: /\\p{Lu}/u, size: 26 },
      // lower
      { regexp: /\\p{Ll}/u, size: 26 },
      // digit
      { regexp: /[0-9]/, size: 10 },
      // special
      { regexp: /\\p{P}|\\p{S}/u, size: 30 },
    ]

    const possibleChars = charsets.reduce(function (possibleChars, charset) {
      let chars = possibleChars
      if (charset.regexp.test(password)) chars += charset.size
      return chars
    }, 0)

    const passwordStrength =
      Math.log(Math.pow(possibleChars, password.length)) / Math.log(2)

    // levels
    const _at33percent = 50
    const _at66percent = 100
    const _at100percent = 150

    let strengthLabel = ''
    let strengthPercentage = 0

    // between 0% and 33%
    if (passwordStrength <= _at33percent) {
      strengthPercentage = (passwordStrength * 33) / _at33percent
      strengthLabel = 'weak'
    } else if (
      passwordStrength > _at33percent &&
      passwordStrength <= _at66percent
    ) {
      // between 33% and 66%
      strengthPercentage = (passwordStrength * 66) / _at66percent
      strengthLabel = 'moderate'
    } else {
      // passwordStrength > 192
      strengthPercentage = (passwordStrength * 100) / _at100percent
      if (strengthPercentage > 100) strengthPercentage = 100
      strengthLabel = 'strong'
    }

    return { percentage: strengthPercentage, label: strengthLabel }
  }
`

const fromUtf8ToArray = `
  function fromUtf8ToArray(str) {
    const strUtf8 = unescape(encodeURIComponent(str))
    const arr = new Uint8Array(strUtf8.length)
    for (let i = 0; i < strUtf8.length; i++) {
      arr[i] = strUtf8.charCodeAt(i)
    }
    return arr
  }
`

// Return a promise that resolves to the hash of the master password.
// This implementation uses the native crypto.subtle from the browser.
const nativeHash = `
  function nativeHash(password, salt, iterations) {
    const subtle = window.crypto.subtle
    const passwordBuf = fromUtf8ToArray(password).buffer
    const saltBuf = fromUtf8ToArray(salt).buffer
    const first = {
      name: 'PBKDF2',
      salt: saltBuf,
      iterations: iterations,
      hash: { name: 'SHA-256' },
    }
    const second = {
      name: 'PBKDF2',
      salt: passwordBuf,
      iterations: 1,
      hash: { name: 'SHA-256' },
    }
    let masterKey
    return subtle
      .importKey('raw', passwordBuf, { name: 'PBKDF2' }, false, ['deriveBits'])
      .then((material) => subtle.deriveBits(first, material, 256))
      .then((key) => {
        masterKey = key
        return subtle.importKey('raw', key, { name: 'PBKDF2' }, false, [
          'deriveBits',
        ])
      })
      .then((material) => subtle.deriveBits(second, material, 256))
      .then((hashed) => {
        let binary = ''
        const bytes = new Uint8Array(hashed)
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i])
        }
        return { hashed: window.btoa(binary), masterKey: masterKey }
      })
  }
`

const randomBytes = `
  function randomBytes(length) {
    const arr = new Uint8Array(length)
    window.crypto.getRandomValues(arr)
    return arr.buffer
  }
`

const fromBufferToB64 = `
  function fromBufferToB64(buffer) {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }
`

// Returns a promise that resolves to a new encryption key, encrypted with
// the masterKey and ready to be sent to the server on onboarding.
const makeEncKey = `
  function makeEncKey(masterKey) {
    const subtle = window.crypto.subtle
    const encKey = randomBytes(64)
    const iv = randomBytes(16)
    return subtle
      .importKey('raw', masterKey, { name: 'AES-CBC' }, false, ['encrypt'])
      .then((impKey) =>
        subtle.encrypt({ name: 'AES-CBC', iv: iv }, impKey, encKey)
      )
      .then((encrypted) => {
        const iv64 = fromBufferToB64(iv)
        const data = fromBufferToB64(encrypted)
        return {
          // 0 means AesCbc256_B64
          cipherString: \`0.\${iv64}|\${data}\`,
          key: encKey,
        }
      })
  }
`

// Returns a promise that resolves to a new key pair, with the private key
// encrypted with the encryption key, and the public key encoded in base64.
const makeKeyPair = `
  function makeKeyPair(symKey) {
    const subtle = window.crypto.subtle
    const encKey = symKey.slice(0, 32)
    const macKey = symKey.slice(32, 64)
    const iv = randomBytes(16)
    const rsaParams = {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
      hash: { name: 'SHA-1' },
    }
    const hmacParams = { name: 'HMAC', hash: 'SHA-256' }
    let publicKey, privateKey, encryptedKey
    return subtle
      .generateKey(rsaParams, true, ['encrypt', 'decrypt'])
      .then((pair) => {
        const publicPromise = subtle.exportKey('spki', pair.publicKey)
        const privatePromise = subtle.exportKey('pkcs8', pair.privateKey)
        return Promise.all([publicPromise, privatePromise])
      })
      .then((keys) => {
        publicKey = keys[0]
        privateKey = keys[1]
        return subtle.importKey('raw', encKey, { name: 'AES-CBC' }, false, [
          'encrypt',
        ])
      })
      .then((impKey) =>
        subtle.encrypt({ name: 'AES-CBC', iv: iv }, impKey, privateKey)
      )
      .then((encrypted) => {
        encryptedKey = encrypted
        return subtle.importKey('raw', macKey, hmacParams, false, ['sign'])
      })
      .then((impKey) => {
        const macData = new Uint8Array(iv.byteLength + encryptedKey.byteLength)
        macData.set(new Uint8Array(iv), 0)
        macData.set(new Uint8Array(encryptedKey), iv.byteLength)
        return subtle.sign(hmacParams, impKey, macData)
      })
      .then((mac) => {
        const public64 = fromBufferToB64(publicKey)
        const iv64 = fromBufferToB64(iv)
        const priv = fromBufferToB64(encryptedKey)
        const mac64 = fromBufferToB64(mac)
        return {
          publicKey: public64,
          // 2 means AesCbc256_HmacSha256_B64
          privateKey: \`2.\${iv64}|\${priv}|\${mac64}\`,
        }
      })
  }
`

export const windowPasswordObjectDeclaration = `
  ${getStrength}
  ${fromUtf8ToArray}
  ${nativeHash}
  ${randomBytes}
  ${fromBufferToB64}
  ${makeEncKey}
  ${makeKeyPair}

  window.password = {
    getStrength: getStrength,
    hash: nativeHash,
    makeEncKey: makeEncKey,
    makeKeyPair: makeKeyPair,
  }
`
