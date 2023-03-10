import { queryResultToCrypto } from '../../../core/services/CozyWebView/CryptoWebView/cryptoObservable/cryptoObservable'

const jsCryptoObservable = `
  function queryResultToCrypto(methodName, param) {
    return new Promise(async (resolve, reject) => {
      const messageId = 'EnsureCrypto_' + uniqueId()
  
      const errorTimeout = setTimeout(() => {
        unsubscribeAnswer(messageId)
        console.error('timeout while waiting for crypto answer')
        reject('timeout while waiting for crypto answer')
      }, 5000)
  
      subscribeAnswer(messageId, result => {
        clearTimeout(errorTimeout)
  
        if (result.error) {
          reject(result.error)
        } else {
          resolve(result)
        }
      })

      const serializedParam = await webviewStringify(param)

      const payload = JSON.stringify({
        type: 'Crypto',
        message: methodName,
        messageId: messageId,
        param: serializedParam
      })

      postMessage(payload)
    })
  }
`

const jsCryptoSubtleBridge = `
  window.crypto.subtle = {
    fake: true,
    decrypt(...args) {
      return queryResultToCrypto('decrypt', args);
    },
    deriveBits(...args) {
      return queryResultToCrypto('deriveBits', args);
    },
    deriveKey(...args) {
      return queryResultToCrypto('deriveKey', args);
    },
    digest(...args) {
      return queryResultToCrypto('digest', args);
    },
    encrypt(...args) {
      return queryResultToCrypto('encrypt', args);
    },
    exportKey(...args) {
      return queryResultToCrypto('exportKey', args);
    },
    generateKey(...args) {
      return queryResultToCrypto('generateKey', args);
    },
    importKey(...args) {
      return queryResultToCrypto('importKey', args);
    },
    sign(...args) {
      return queryResultToCrypto('sign', args);
    },
    unwrapKey(...args) {
      return queryResultToCrypto('unwrapKey', args);
    },
    verify(...args) {
      return queryResultToCrypto('verify', args);
    },
    wrapKey(...args) {
      return queryResultToCrypto('wrapKey', args);
    }
  }
`

export const jsEnsureCrypto = `
  ${jsCryptoObservable}

  window.cozy.ensureCrypto = function() {
    if (window?.crypto?.subtle) {
      return
    }

    crypto.fake = true

    ${jsCryptoSubtleBridge}
  }

  window.cozy.ensureCrypto()
`

export const tryCrypto = async (payload, logger, logId, onAnswer) => {
  try {
    const { data: rawData } = payload.nativeEvent

    const dataPayload = JSON.parse(rawData)

    if (dataPayload.type !== 'Crypto') return

    const { message, messageId, param } = dataPayload

    logger.info(`[Crypto ${logId}]`, { message, messageId })
    try {
      const result = await queryResultToCrypto('sublteProxy', {
        methodName: message,
        param: param
      })
      onAnswer(messageId, result)
    } catch (e) {
      onAnswer(messageId, JSON.stringify({ error: e }))
    }
  } catch (e) {
    logger.error('error', e)
  }
}
