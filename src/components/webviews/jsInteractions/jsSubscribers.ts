import { Platform } from 'react-native'

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

export const jsSubscribers = `
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

    if(dataPayload.type !== 'Crypto' && dataPayload.type !== 'NavigatorShare' && dataPayload.type !== 'NavigatorClipboard') {
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
      \`Subscribers registered answer... \${answerSubscribers.length} answer(s) are now subscribed\`
    )
  }

  function unsubscribeAnswer(messageId) {
    answerSubscribers = answerSubscribers.filter(({ id }) => id !== messageId)
    console.debug(
      \`Subscribers cleared answer... \${answerSubscribers.length} answer(s) are now subscribed\`
    )
  }
`
