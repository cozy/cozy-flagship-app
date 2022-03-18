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

    let hashed, masterKey

    window.password
      .hash(pass, salt, iterations)
      .then((result) => {
        hashed = result.hashed
        return window.password.makeEncKey(result.masterKey)
      })
      .then((key) => {
        masterKey = key.cipherString
        return window.password.makeKeyPair(key.key)
      })
      .then((pair) => {
        const payloadResult = JSON.stringify({
          message: 'answer___computePass',
          messageId: messageId,
          param: {
            iterations,
            key: masterKey,
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
            result: 'something_went_wrong'
          }
        })

        postMessage(payloadResult)
      })
  }
`
