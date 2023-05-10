import Minilog from '@cozy/minilog'

import { MessengerInterface } from 'cozy-clisk'

/**
 * post-me messenger implementation for the react native launcher
 */
export default class ReactNativeLauncherMessenger extends MessengerInterface {
  constructor({ webViewRef, debug, label }) {
    super()
    this.webViewRef = webViewRef
    this.debug = debug
    this.label = label
    this.log = Minilog(label)
  }

  postMessage(message) {
    if (this.debug) {
      let debugMessage = '➡️  sending message'
      const { label, rest } = formatIds(message)
      debugMessage += ' ' + label
      this.log.debug(debugMessage, rest)
    }
    const script = `window.postMessage(${JSON.stringify(message)})`
    this.webViewRef.injectJavaScript(script)
  }
  addMessageListener(listener) {
    this.listener = listener

    const removeListener = () => {
      this.listener = null
    }

    return removeListener
  }

  /**
   * call the listener when a message is received on the webview
   *
   * @param {object} event : react native event
   */
  onMessage(event) {
    const data = JSON.parse(event.nativeEvent.data)
    this.listener({ data })
    if (this.debug) {
      let debugMessage = '⬅️  received message'
      const { label, rest } = formatIds(data)
      debugMessage += ' ' + label
      this.log.debug(debugMessage, rest)
    }
  }
}

function formatIds(message) {
  const { sessionId, requestId, ...rest } = message
  let label = 'sessionId=' + sessionId
  if (requestId) {
    label += ' requestId=' + requestId
  }
  return { label, rest }
}
