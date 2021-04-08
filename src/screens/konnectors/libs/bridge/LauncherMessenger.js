export default class LauncherMessenger {
  constructor({webViewRef}) {
    this.webViewRef = webViewRef
  }

  postMessage(message) {
    // console.log('postMessage(message)', message)
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

  onMessage(event) {
    const data = JSON.parse(event.nativeEvent.data)
    // console.log('onMessage data', data)
    this.listener({data})
  }
}
