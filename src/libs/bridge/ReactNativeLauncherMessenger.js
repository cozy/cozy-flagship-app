import {MessengerInterface} from './bridgeInterfaces'

/**
 * post-me messenger implementation for the react native launcher
 */
export default class ReactNativeLauncherMessenger extends MessengerInterface {
  constructor({webViewRef}) {
    super()
    this.webViewRef = webViewRef
  }

  postMessage(message) {
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
    this.listener({data})
  }
}
