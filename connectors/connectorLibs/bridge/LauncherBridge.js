import {ChildHandshake} from 'post-me'
import ReactNativeWebviewMessenger from './ContentScriptMessenger'
import {Bridge} from '../../libs'

/**
 * Bridge to the Launcher object via post-me
 */
export default class LauncherBridge extends Bridge {
  /**
   * Init the window which will be used to communicate with the launcher
   *
   * @param {Object} options.localWindow : The window used to communicate with the launcher
   */
  constructor({localWindow}) {
    super()
    this.localWindow = localWindow
  }

  async init({exposedMethods = {}} = {}) {
    const messenger = new ReactNativeWebviewMessenger({
      localWindow: this.localWindow,
    })
    this.connection = await ChildHandshake(messenger, exposedMethods)
    this.localHandle = this.connection.localHandle()
    this.remoteHandle = this.connection.remoteHandle()
  }
}
