import Clipboard from '@react-native-clipboard/clipboard'
import { WebViewMessageEvent } from 'react-native-webview/lib/WebViewTypes'

import { OnAnswerCallback, SubscriberPayload } from './types'

type NavigatorClipboardParams =
  | {
      method: 'readText'
    }
  | {
      method: 'writeText'
      text: string | undefined
    }

const jsNavigatorClipboardObservable = `
  function queryResultToNativeClipboard(param) {
    return new Promise(async (resolve, reject) => {
      const messageId = 'EnsureNavigatorClipboard_' + uniqueId()

      const errorTimeout = setTimeout(() => {
        unsubscribeAnswer(messageId)
        console.error('timeout while waiting for native clipboard answer')
        reject('timeout while waiting for native clipboard answer')
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
        type: 'NavigatorClipboard',
        messageId: messageId,
        param: serializedParam
      })

      postMessage(payload)
    })
  }
`

const jsNavigatorClipboardBridge = `
  navigator.clipboard = {
    readText: () => {
      const payload = {
        method: 'readText'
      }

      return queryResultToNativeClipboard(payload);
    },
    writeText: (text) => {
      const payload = {
        method: 'writeText',
        text
      }

      return queryResultToNativeClipboard(payload);
    },
    read: () => {
      throw new Error('navigator.clipboard.read() is not implemented in flagship app. Please use readText() instead.')
    },
    write: () => {
      throw new Error('navigator.clipboard.write() is not implemented in flagship app. Please use writeText() instead.')
    }
  }
`

export const jsEnsureNavigatorClipboard = `
  ${jsNavigatorClipboardObservable}

  window.cozy.ensureNavigatorClipboard = function() {
    ${jsNavigatorClipboardBridge}
  }

  window.cozy.ensureNavigatorClipboard()
`

export const tryNavigatorClipboard = async (
  payload: WebViewMessageEvent,
  logger: MiniLogger,
  logId: string,
  onAnswer: OnAnswerCallback
): Promise<void> => {
  try {
    const { data: rawData } = payload.nativeEvent

    const dataPayload = JSON.parse(rawData) as SubscriberPayload

    if (dataPayload.type !== 'NavigatorClipboard') return

    const { messageId, param } = dataPayload

    const params = JSON.parse(param) as NavigatorClipboardParams

    logger.info(`[NavigatorClipboard ${logId}]`, { method: params.method })
    try {
      if (params.method === 'readText') {
        const textFromNativeClipboard = await Clipboard.getString()
        onAnswer(messageId, JSON.stringify(textFromNativeClipboard))
      } else {
        Clipboard.setString(params.text ?? '')
        onAnswer(messageId, JSON.stringify(''))
      }
    } catch (e) {
      onAnswer(messageId, JSON.stringify(''))
    }
  } catch (e) {
    logger.error('error', e)
  }
}
