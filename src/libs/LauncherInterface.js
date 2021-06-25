/**
 * All launchers are supposed to implement this interface
 *
 * @interface
 */
export default class LauncherInterface {
  /**
   * Inject the content script and initialize the bridge to communicate it
   *
   * @param  {Object} options.bridgeOptions : options which will be given as is to the bridge. Bridge options depend on the environment of the launcher
   * @param  {String} options.contentScript : source code of the content script which will be injected
   *
   * @return {Bridge}
   */
  async init({bridgeOptions, contentScript}) {}

  /**
   * Start the connector execution
   *
   * @return {Bridge}
   */
  async start() {}

  /**
   * Get content script logs. This function is called by the content script via the bridge
   *
   * @param  {ContentScriptLogMessage} message : log message
   */
  log(message) {}
}
