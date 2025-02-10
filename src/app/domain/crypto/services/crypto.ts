import QuickCrypto from 'react-native-quick-crypto'

const base64urlencode = (a: Uint8Array): string => {
  let str = ''

  const bytes = new Uint8Array(a)
  const len = bytes.byteLength

  for (let i = 0; i < len; i++) {
    str += String.fromCharCode(bytes[i])
  }

  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export const generateHttpServerSecurityKey = (): string => {
  const array = new Uint8Array(16)
  QuickCrypto.getRandomValues(array)

  const securityKey = base64urlencode(array)

  return securityKey
}

const sha256 = async (value: string): Promise<Uint8Array> => {
  // TextEncoder is implemented only starting RN 0.74
  // Using text-encoding-polyfill for this POC
  const encoder = new TextEncoder()
  const data = encoder.encode(value)
  const buffer = await QuickCrypto.subtle.digest('SHA-256', data)

  return new Uint8Array(buffer)
}

const generateCodeVerifier = (): string => {
  const array = new Uint8Array(32)
  window.crypto.getRandomValues(array)
  return base64urlencode(array)
}

const generateCodeChallengeFromVerifier = async (
  value: string
): Promise<string> => {
  const hashed = await sha256(value)
  const base64encoded = base64urlencode(hashed)
  return base64encoded
}

interface PKCE {
  codeVerifier: string
  codeChallenge: string
}

/**
 * Create and return a couple of PKCE keys
 *
 * @returns {PKCE} PKCE codes
 * throws
 */
export const createPKCE = async (): Promise<PKCE> => {
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await generateCodeChallengeFromVerifier(codeVerifier)

  const pkce = {
    codeVerifier,
    codeChallenge
  }
  return pkce
}
