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
    if (this.debug && message.type === '@post-me') {
      let debugMessage = '➡️  sending message'
      const { label, rest } = formatIds(message)
      debugMessage += ' ' + label
      if (rest.action === 'handshake-request') {
        this.log.debug(label, 'handshake request 👊')
      } else {
        this.log.debug(debugMessage, rest)
      }
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
    if (this.listener) {
      // in scenarios where we watch the flagship app with hot reload I found this.listener to be null sometimes.
      // As addMessageListener is directly called by post-me, I don't know why, it may be null but this avoids some headaches
      // when developing on flagship app.
      this.listener({ data })
    }
    if (this.debug && data.type === '@post-me' && data.eventName !== 'log') {
      let debugMessage = '⬅️  received message'
      const { label, rest } = formatIds(data)
      debugMessage += ' ' + label
      if (rest.action === 'handshake-response') {
        this.log.debug(label, 'handshake response 👊 ✅')
      } else {
        this.log.debug(debugMessage, rest)
      }
    }
  }
}

function formatIds(message) {
  // eslint-disable-next-line no-unused-vars
  const { sessionId, requestId, type, ...rest } = message
  let label = 'sessionId=' + sessionId
  if (requestId !== undefined) {
    label += ' requestId=' + requestId
  }
  return { label, rest }
}
