import {Platform} from 'react-native'

const androidMessageListener = `
window.document.addEventListener('message', function (e) {
  processReadonlyMessage(e.data)
})
`

const iosMessageListener = `
window.addEventListener('message', function (e) {
  processReadonlyMessage(e.data)
})
`

/**
 * Generates the JS code that listen for a 'setReadonly' message and enable/disable
 * a list of components. The list of affected component is defined in params
 *
 * @param {string[]} componentIds - id of components that should enabled/disabled
 * @returns JS code to include in a webview
 */
export const readonlyJs = componentIds => {
  const disable = componentIds
    .map(componentId => {
      return `
        document.getElementById('${componentId}').setAttribute('disabled', true)
      `
    })
    .join('')

  const enable = componentIds
    .map(componentId => {
      return `
        document.getElementById('${componentId}').removeAttribute('disabled')
      `
    })
    .join('')

  return `
function processReadonlyMessage (message) {
  const payload = JSON.parse(message)

  const {
    message: functionName,
    param
  } = payload

  if (functionName === 'setReadonly') {
    if (param) {
      ${disable}
    } else {
      ${enable}
    }
  }
}
${Platform.OS === 'ios' ? iosMessageListener : androidMessageListener}
`
}
