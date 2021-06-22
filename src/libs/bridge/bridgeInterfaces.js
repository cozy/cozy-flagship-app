/**
 * @typedef PostMeConnection
 * @property {function} localHandle  : get handle to the local end of the connection
 * @property {function} remoteHandle : get handle to the remote end of the connection
 * @property {function} close        : stop listening to incoming message from the other side
 */

/**
 * All bridges are supposed to implement this interface
 */
export class Bridge {
  /**
   * Initialize the communication between the parent and the child via post-me protocol
   * https://github.com/alesgenova/post-me
   *
   * @param  {Object} options.exposedMethods  : The list of methods of the launcher and their implementation, which will be exposed via the post-me interface
   * @return {PostMeConnection} : the resulting post-me connection
   */
  async init({exposedMethods}) {}

  /**
   * Shortcut to remoteHandle.call method
   *
   * @param  {string} method : The remote method name
   * @param  {array} args    : Any number of parameters which will be given to the remote method.
   * It is also possible to pass callback functions (which must support serialization). post-me
   * will wait the the remote method end before resolving the promise
   *
   *
   * @return {any} remote method return value
   */
  async call(method, ...args) {
    return this.remoteHandle.call(method, ...args)
  }

  /**
   * Shortcut to localHandle.emit method. Will emit an event which could be listened by the remote
   * object
   *
   * @param  {string} eventName
   * @param  {array} args : Any number of parameters.
   */
  emit(eventName, ...args) {
    this.localHandle.emit(eventName, ...args)
  }

  /**
   * Shortcut to remoteHandle.addEventListener method. Will listen to the given event on the remote
   * object and call the listener function
   *
   * @param  {string} remoteEventName
   * @param  {function} listener
   */
  addEventListener(remoteEventName, listener) {
    this.remoteHandle.addEventListener(remoteEventName, listener)
  }

  /**
   * Shortcut to remoteHandle.removeEventListener method. Will stop listening to the given event
   * on the remote object.
   *
   * @param  {string} remoteEventName
   * @param  {function} listener : previously defined listener function
   */
  removeEventListener(remoteEventName, listener) {
    this.remoteHandle.removeEventListener(remoteEventName, listener)
  }
}

/**
 * All messengers are supposed to implement this interface
 *
 * @interface
 */
export class MessengerInterface {
  /**
   * Send a message to the other context
   *
   * @param {string} message : The payload of the message
   */
  postMessage(message) {}

  /**
   * Add a listener to messages received by the other context
   *
   * @param {function} listener : A listener that will receive the MessageEvent
   * @return {function} A function that can be invoked to remove the listener
   */
  addMessageListener(listener) {}
}
