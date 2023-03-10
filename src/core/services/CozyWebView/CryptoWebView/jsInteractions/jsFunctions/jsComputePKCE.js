/**
 * API to create new PKCE keys
 *
 * More information: https://datatracker.ietf.org/doc/html/rfc7636
 * More information: https://docs.cozy.io/en/cozy-stack/auth/#pkce-extension
 */
export const computePKCEFunctionDeclaration = `
  function dec2hex(dec) {
    return ('0' + dec.toString(16)).substr(-2)
  }

  async function sha256(plain) {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return await window.crypto.subtle.digest('SHA-256', data)
  }

  function base64urlencode(a) {
    var str = ''
    var bytes = new Uint8Array(a)
    var len = bytes.byteLength
    for (var i = 0; i < len; i++) {
      str += String.fromCharCode(bytes[i])
    }
    return btoa(str)
      .replace(/\\+/g, '-')
      .replace(/\\//g, '_')
      .replace(/=+$/, '')
  }
  
  function generateCodeVerifier() {
    var array = new Uint8Array(32)
    window.crypto.getRandomValues(array)
    return base64urlencode(array)
  }

  async function generateCodeChallengeFromVerifier(v) {
    var hashed = await sha256(v)
    var base64encoded = base64urlencode(hashed)
    return base64encoded
  }

  async function computePKCE(messageId) {
    try {
      const codeVerifier = generateCodeVerifier()
      const codeChallenge = await generateCodeChallengeFromVerifier(codeVerifier)

      const payloadResult = JSON.stringify({
        message: 'answer___computePKCE',
        messageId: messageId,
        param: {
          codeVerifier,
          codeChallenge
        }
      })

      postMessage(payloadResult)
    } catch (error) {
      const payloadResult = JSON.stringify({
        message: 'answer___computePKCE',
        messageId: messageId,
        param: {
          error: 'Something went wrong while computing PKCE keys: ' + error.message
        }
      })

      postMessage(payloadResult)
    }
  }
`
