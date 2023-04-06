import { NativeModules, Platform } from 'react-native'
import type { WebView } from 'react-native-webview'

import log from 'cozy-logger'

interface NativeKeyboard {
  forceKeyboard: () => void
}

const Keyboard = NativeModules.Keyboard as NativeKeyboard

export const setFocusOnWebviewField = (
  webview: WebView,
  fieldId: string
): void => {
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
