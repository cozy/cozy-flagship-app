import {ChildHandshake} from 'post-me'
import ContentScriptMessenger from './ContentScriptMessenger.js'
import {Bridge} from '../../../../libs'

/**
 * Bridge to the Launcher object via post-me
 */
export default class LauncherBridge extends Bridge {
  constructor({localWindow}) {
    this.localWindow = localWindow
  }

  async init({exposedMethods = {}} = {}) {
    const messenger = new ContentScriptMessenger({
      localWindow: this.localWindow,
    })
    this.connection = await ChildHandshake(messenger, exposedMethods)
    this.localHandle = this.connection.localHandle()
    this.remoteHandle = this.connection.remoteHandle()
  }
}
