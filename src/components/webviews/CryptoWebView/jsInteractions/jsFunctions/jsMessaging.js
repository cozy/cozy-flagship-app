import { Platform } from 'react-native'

export const postMessageFunctionDeclaration = `
function postMessage (message) {
  if (window.ReactNativeWebView.postMessage === undefined) {
    setTimeout(postMessage, 200, message)
  } else {
    window.ReactNativeWebView.postMessage(message)
  }
}
`

const androidMessageListener = `
window.document.addEventListener('message', function (e) {
  processMessage(e.data)
})
`

const iosMessageListener = `
window.addEventListener('message', function (e) {
  processMessage(e.data)
})
`

export const listenMessageFunctionDeclaration = `
function processMessage (message) {
  const payload = JSON.parse(message)

  const {
    message: functionName,
    messageId,
    param
  } = payload

  if (Object.keys(messagingFunctions).includes(functionName)) {
    messagingFunctions[functionName](messageId, param)
  } else {
    console.log('unrecognizedMessage')
  }
}

${Platform.OS === 'ios' ? iosMessageListener : androidMessageListener}
`
