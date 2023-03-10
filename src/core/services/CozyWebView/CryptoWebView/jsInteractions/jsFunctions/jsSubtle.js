import { strinfigy, parse } from './jsSerializeCrypto'

export const subtleFunctionDeclaration = `
  ${strinfigy}

  ${parse}

  async function sublteProxy(messageId, subtleParam) {
    let { methodName, param: serializedParam } = subtleParam
  
    const param = await webviewParse(serializedParam)

    window.crypto.subtle[methodName](...param)
      .then(async (result) => {
        // if we import a crypto key, we want to save how we imported it
        // so we can send that back and re-create the key later
        if (methodName === "importKey") {
          result._import = {
            format: param[0],
            keyData: param[1]
          }
        }

        const payloadResult = JSON.stringify({
          message: 'answer___sublteProxy',
          messageId: messageId,
          param: await webviewStringify(result)
        })

        postMessage(payloadResult)
      })
      .catch((err) => {
        const payloadResult = JSON.stringify({
          message: 'answer___sublteProxy',
          messageId: messageId,
          param: {
            error: 'Something went wrong while computing Subtle method: ' + err.message
          }
        })

        postMessage(payloadResult)
      })
  }
`
