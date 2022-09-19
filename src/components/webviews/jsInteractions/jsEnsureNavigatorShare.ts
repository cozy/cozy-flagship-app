import { Share } from 'react-native'
import { WebViewMessageEvent } from 'react-native-webview/lib/WebViewTypes'
import { OnAnswerCallback, SubscriberPayload } from './types'

interface NavigatorShareParams {
  text: string
  title: string
  url: string
}

const jsNavigatorShareObservable = `
  function queryResultToNativeShare(param) {
    return new Promise(async (resolve, reject) => {
      const messageId = 'EnsureNavigatorShare_' + uniqueId()
  
      const errorTimeout = setTimeout(() => {
        unsubscribeAnswer(messageId)
        console.error('timeout while waiting for native share answer')
        reject('timeout while waiting for native share answer')
      }, 5000)
  
      subscribeAnswer(messageId, result => {
        clearTimeout(errorTimeout)
  
        if (result.error) {
          reject(result.error)
        } else {
          resolve(result)
        }
      })

      const serializedParam = await JSON.stringify(param)

      const payload = JSON.stringify({
        type: 'NavigatorShare',
        messageId: messageId,
        param: serializedParam
      })

      postMessage(payload)
    })
  }
`

const jsNavigatorShareBridge = `
  navigator.share = (args) => {
    return queryResultToNativeShare(args);
  }
`

export const jsEnsureNavigatorShare = `
  ${jsNavigatorShareObservable}

  window.cozy.ensureNavigatorShare = function() {
    if (navigator?.share) {
      return
    }

    ${jsNavigatorShareBridge}
  }

  window.cozy.ensureNavigatorShare()
`

export const tryNavigatorShare = async (
  payload: WebViewMessageEvent,
  logger: MiniLogger,
  logId: string,
  onAnswer: OnAnswerCallback
): Promise<void> => {
  try {
    const { data: rawData } = payload.nativeEvent

    const dataPayload = JSON.parse(rawData) as SubscriberPayload

    if (dataPayload.type !== 'NavigatorShare') return

    const { messageId, param } = dataPayload

    const {
      text: message,
      title,
      url
    } = JSON.parse(param) as NavigatorShareParams

    logger.info(`[NavigatorShare ${logId}]`, { title, message, url })
    try {
      const result = await Share.share({
        title,
        message,
        url
      })

      const success = result.action !== Share.dismissedAction

      onAnswer(messageId, JSON.stringify(success))
    } catch (e) {
      onAnswer(messageId, 'false')
    }
  } catch (e) {
    logger.error('error', e)
  }
}
