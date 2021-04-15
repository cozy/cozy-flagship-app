import {ParentHandshake} from 'post-me'
import {Bridge} from '../../../../libs/bridgeHelpers'
import ReactNativeLauncherMessenger from './ReactNativeLauncherMessenger'

/**
 * Bridge to the contentScript object via post-me
 */
export default class ContentScriptBridge extends Bridge {
  constructor({webViewRef}) {
    super()
    this.webViewRef = webViewRef
  }

  async init({exposedMethods = {}} = {}) {
    this.messenger = new ReactNativeLauncherMessenger({
      webViewRef: this.webViewRef,
    })

    this.connection = await ParentHandshake(this.messenger, exposedMethods)
    this.localHandle = this.connection.localHandle()
    this.remoteHandle = this.connection.remoteHandle()

    return this.connection
  }
}
