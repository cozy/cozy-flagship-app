import {MessengerInterface} from './bridgeInterfaces'
import Minilog from '@cozy/minilog'

/**
 * post-me messenger implementation for the react native launcher
 */
export default class ReactNativeLauncherMessenger extends MessengerInterface {
  constructor({webViewRef, debug, label}) {
    super()
    this.webViewRef = webViewRef
    this.debug = debug
    this.label = label
    this.log = Minilog(label)
  }

  postMessage(message) {
    if (this.debug) {
      this.log.debug('➡️ sending message', message)
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
    if (this.debug) {
      this.log.debug('⬅️ received message', data)
    }
    this.listener({data})
  }
}
