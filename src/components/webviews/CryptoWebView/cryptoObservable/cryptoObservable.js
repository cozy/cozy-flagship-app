import Minilog from 'cozy-minilog'
import uniqueId from 'lodash/uniqueId'

const log = Minilog('CryptoObservable')

/** @type {CryptoSubscriber[]} */
let subscribers = []

/** @type {CryptoAnswerSubscriber[]} */
let answerSubscribers = []

/**
 * Register the given callback into CryptoObservable's subscribers list
 * The callback should be able to handle cryptography related queries like `computePass`
 * @param {CryptoSubscriber} callback
 */
export const subscribeToCrypto = callback => {
  if (subscribers.includes(callback)) {
    throw new Error('callback already registered to CryptoObservable')
  }

  subscribers = [...subscribers, callback]

  log.debug(
    `subscribed... ${subscribers.length} callback(s) are now subscribed`
  )
}

/**
 * Unregister the given callback from CryptoObservable's subscribers list
 * @param {CryptoSubscriber} callbackToRemove
 */
export const unsubscribeFromCrypto = callbackToRemove => {
  if (!subscribers.includes(callbackToRemove)) {
    throw new Error('callback is not registered to CryptoObservable')
  }

  subscribers = subscribers.filter(listener => callbackToRemove !== listener)

  log.debug(
    `unsubscribed... ${subscribers.length} callback(s) are now subscribed`
  )
}

/**
 * Ask to the CryptoObservable's subscribers to execute the given cryptography method
 * with given params and then to return the computed result
 * @param {CryptoMethodName} methodName - name of the cryptography method to be called
 * @param {object} [param] - parameters to be passed into the called cryptography method
 * @returns {Promise<CryptoMessage>}
 */
export const queryResultToCrypto = (methodName, param) => {
  return new Promise((resolve, reject) => {
    const messageId = uniqueId()

    const errorTimeout = setTimeout(() => {
      unsubscribeAnswer(messageId)
      reject('timeout while waiting for crypto answer')
    }, 5000)

    subscribeAnswer(messageId, result => {
      clearTimeout(errorTimeout)

      if (result.error) {
        log.error('REJECTION')
        reject(result.error)
      } else {
        resolve(result)
      }
    })

    subscribers.forEach(listener => {
      listener(methodName, messageId, param)
    })
  })
}

/**
 * Send the result of a cryptography method back to the awaiting caller
 * @param {CryptoMessage} answer
 */
export const sendAnswer = answer => {
  const { messageId, param } = answer

  const subscriber = answerSubscribers.find(({ id }) => id === messageId)

  if (subscriber) {
    subscriber.callback(param)

    unsubscribeAnswer(messageId)
  }
}

const subscribeAnswer = (messageId, callback) => {
  answerSubscribers.push({
    id: messageId,
    callback: callback
  })

  log.debug(
    `registered answer... ${answerSubscribers.length} answer(s) are now subscribed`
  )
}

const unsubscribeAnswer = messageId => {
  answerSubscribers = answerSubscribers.filter(({ id }) => id !== messageId)
  log.debug(
    `cleared answer... ${answerSubscribers.length} answer(s) are now subscribed`
  )
}
