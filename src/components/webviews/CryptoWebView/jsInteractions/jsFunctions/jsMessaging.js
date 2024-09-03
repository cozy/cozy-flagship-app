import { Platform } from 'react-native'

const errorHandler = `
  window.addEventListener('error', error => {
    postMessage(JSON.stringify({
      isError: true,
      message: error.message,
      filename: error.filename,
      lineno: error.lineno,
      colno: error.colno,
      error: error.error
    }))
  })
`

export const postMessageFunctionDeclaration = `
function postMessage (message) {
  if (window.ReactNativeWebView.postMessage === undefined) {
    setTimeout(postMessage, 200, message)
  } else {
    window.ReactNativeWebView.postMessage(message)
  }
}

${errorHandler}
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
