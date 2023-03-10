/**
 * @typedef {object} CryptoMessage
 * @property {string} message -
 * @property {string} param -
 * @property {string} [idMessage] -
 */

/**
 * @typedef {('computePass'|'computePKCE')} CryptoMethodName
 */

/**
 * CryptoObservable's subscriber that can handle cryptography related queries
 * @callback CryptoSubscriber
 * @param {CryptoMethodName} methodName - name of the JS method that should be called in CryptoWebView
 * @param {string} id - id of the query message
 * @param {object} [param] - parameters passed to the JS method
 */

/**
 * CryptoObservable's answer that should be send by subscribers after computing cryptography results
 * @callback CryptoAnswerSubscriber
 * @param {string} messageId - id of the message that should be send back in the answer
 * @param {CryptoMessage} callback - callback responsible to resolve the caller promise
 */
