/**
 * API to hash password and compute its public/private/master keys
 */
export const computePassFunctionDeclaration = `
  function computePass(messageId, passData) {
    const {
      pass,
      salt,
      iterations
    } = passData

    let hashed, masterKey, protectedKey

    window.password
      .hash(pass, salt, iterations)
      .then((result) => {
        hashed = result.hashed
        masterKey = result.masterKey
        return window.password.makeEncKey(result.masterKey)
      })
      .then((key) => {
        protectedKey = key.cipherString
        return window.password.makeKeyPair(key.key)
      })
      .then((pair) => {
        const payloadResult = JSON.stringify({
          message: 'answer___computePass',
          messageId: messageId,
          param: {
            iterations,
            key: protectedKey,
            publicKey: pair.publicKey,
            privateKey: pair.privateKey,
            passwordHash: hashed,
            masterKey: masterKey
          }
        })

        postMessage(payloadResult)
      })
      .catch((err) => {
        const payloadResult = JSON.stringify({
          message: 'answer___computePAss',
          messageId: messageId,
          param: {
            error: 'Something went wrong while computing PKCE keys: ' + err.message
          }
        })

        postMessage(payloadResult)
      })
  }
`
