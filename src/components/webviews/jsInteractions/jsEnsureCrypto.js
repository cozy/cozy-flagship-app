import { Platform } from 'react-native'

import { queryResultToCrypto } from '/components/webviews/CryptoWebView/cryptoObservable/cryptoObservable'
import {
  strinfigy,
  parse
} from '/components/webviews/CryptoWebView/jsInteractions/jsFunctions/jsSerializeCrypto'

const androidMessageListener = `
window.document.addEventListener('message', function (e) {
  handleAnswer(e.data)
})
`

const iosMessageListener = `
window.addEventListener('message', function (e) {
  handleAnswer(e.data)
})
`

const jsCryptoObservable = `
  ${Platform.OS === 'ios' ? iosMessageListener : androidMessageListener}

  ${strinfigy}

  ${parse}

  let answerSubscribers = []

  let _uniqueId = 1
  function uniqueId() {
    _uniqueId += 1

    if(_uniqueId > 1000) {
      _uniqueId = 0
    }

    return _uniqueId
  }

  async function handleAnswer(rawData) {
    if(typeof rawData !== 'string') {
      return
    }

    const dataPayload = JSON.parse(rawData)

    if(dataPayload.type !== 'Crypto') {
      return
    }

    const { messageId, param: serializedParam } = dataPayload

    const param = await webviewParse(serializedParam)
  
    const subscriber = answerSubscribers.find(({ id }) => id === messageId)
  
    if (subscriber) {
      unsubscribeAnswer(messageId)

      subscriber.callback(param)
    }
  }

  function subscribeAnswer(messageId, callback) {
    answerSubscribers.push({
      id: messageId,
      callback: callback
    })
  
    console.debug(
      \`EnsureCrypto registered answer... \${answerSubscribers.length} answer(s) are now subscribed\`
    )
  }
  
  function unsubscribeAnswer(messageId) {
    answerSubscribers = answerSubscribers.filter(({ id }) => id !== messageId)
    console.debug(
      \`EnsureCrypto cleared answer... \${answerSubscribers.length} answer(s) are now subscribed\`
    )
  }

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
