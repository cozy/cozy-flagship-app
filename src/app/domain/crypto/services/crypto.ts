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
