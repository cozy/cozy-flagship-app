import { Platform } from 'react-native'

const androidShowErrorMessageListener = `
window.document.addEventListener('message', function (e) {
  errorEventListener(e.data)
})
`

const iosShowErrorMessageListener = `
window.addEventListener('message', function (e) {
  errorEventListener(e.data)
})
`

/**
 * Add an event listener to handle error message and show error
 *
 * @returns JS code to include in a webview
 */
export const handleErrorMessage = () => {
  return `
function errorEventListener (message) {
  const payload = JSON.parse(message)

  const {
    message: functionName,
    param
  } = payload

  if (functionName === 'setErrorMessage') {
    const loginField = document.getElementById('login-field')
    window.showError(loginField, param)
  }
}
${
  Platform.OS === 'ios'
    ? iosShowErrorMessageListener
    : androidShowErrorMessageListener
}
`
}
