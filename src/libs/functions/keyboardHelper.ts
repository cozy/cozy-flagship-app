import { NativeModules, Platform } from 'react-native'
import type { WebView, WebViewMessageEvent } from 'react-native-webview'

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

export const handleAutofocusFields = `
  if (!window.cozy) window.cozy = {}
  window.cozy.checkAutofocus = () => {
    const autofocusField = document.querySelector("[autofocus]")

    if (autofocusField) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        message: 'queryKeyboard',
        fieldId: autofocusField.id
      }))
    }
  }
  window.addEventListener("load", function(event) {
    window.cozy.checkAutofocus()
  })
`

export const triggerAutofocusFocusOnWebview = (webview: WebView): void => {
  try {
    if (Platform.OS === 'android') {
      webview.injectJavaScript(`
        window.cozy.checkAutofocus()
      `)
    }
  } catch {
    log('error', 'Error on trigger autofocus')
  }
}

interface KeyboardMessage {
  message: string
  fieldId: string
}

export const tryProcessQueryKeyboardMessage = (
  webview: WebView,
  event: WebViewMessageEvent
): void => {
  try {
    const message = JSON.parse(event.nativeEvent.data) as KeyboardMessage

    if (message.message === 'queryKeyboard' && message.fieldId) {
      setFocusOnWebviewField(webview, message.fieldId)
    }
  } catch {
    log('error', 'Error on querying keyboard')
  }
}
