import { queryResultToCrypto } from '/components/webviews/CryptoWebView/cryptoObservable/cryptoObservable'

interface PkceResult {
  codeVerifier: string
  codeChallenge: string
}

/**
 * Create and return a couple of PKCE keys
 * To make the PKCE creation possible, a CryptoWebView must be present in the ReactNative component tree
 *
 * @returns {object} message result from the CryptoWebView's `computePKCE` method
 * throws
 */
export const createPKCE = async (): Promise<PkceResult> => {
  return (await queryResultToCrypto('computePKCE', {})) as unknown as PkceResult
}
