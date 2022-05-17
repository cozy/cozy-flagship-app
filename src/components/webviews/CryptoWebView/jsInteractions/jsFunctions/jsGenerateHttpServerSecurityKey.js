/**
 * API to create a new security key for the local HttpServer
 */
export const generateHttpServerSecurityKeyFunctionDeclaration = `
  async function generateHttpServerSecurityKey(messageId) {
    try {
      const array = new Uint8Array(16)
      window.crypto.getRandomValues(array)
      
      const securityKey = base64urlencode(array)

      const payloadResult = JSON.stringify({
        message: 'answer___generateHttpServerSecurityKey',
        messageId: messageId,
        param: {
          securityKey
        }
      })

      postMessage(payloadResult)
    } catch (error) {
      const payloadResult = JSON.stringify({
        message: 'answer___generateHttpServerSecurityKey',
        messageId: messageId,
        param: {
          error: 'Something went wrong while computing HttpServer security key: ' + error.message
        }
      })

      postMessage(payloadResult)
    }
  }
`
