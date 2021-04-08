import {MessengerInterface} from '../../../../libs'

/**
 * post-me messenger implementation for a content script
 */
export default class ContentScriptMessenger extends MessengerInterface {
  constructor({localWindow}) {
    this.localWindow = localWindow
  }
  postMessage(message) {
    this.localWindow.ReactNativeWebView.postMessage(JSON.stringify(message))
  }
  addMessageListener(listener) {
    const outerListener = (event) => {
      listener(event)
    }

    this.localWindow.addEventListener('message', outerListener)

    const removeListener = () => {
      this.localWindow.removeEventListener('message', outerListener)
    }

    return removeListener
  }
}
