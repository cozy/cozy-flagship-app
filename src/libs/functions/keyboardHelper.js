import { NativeModules, Platform } from 'react-native'
import log from 'cozy-logger'

const Keyboard = NativeModules.Keyboard

export const setFocusOnWebviewField = (webview, fieldId) => {
  try {
    if (Platform.OS === 'android') {
      webview.requestFocus()

      webview.injectJavaScript(`
        document.getElementById('${fieldId}').focus()
      `)

      setTimeout(() => {
        Keyboard.forceKeyboard()
      }, 10)
    }
  } catch {
    log('error', 'Error on opening the keyboard')
  }
}
