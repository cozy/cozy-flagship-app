import type { WebViewMessageEvent } from 'react-native-webview'

interface ClouderyMessage {
  message: string
  color?: string
}

type SetBackgroundColorCallback = (color: string) => void

export const fetchBackgroundOnLoad = `
(function() {
  window.addEventListener("load", function(event) {
    const color = getComputedStyle(
      document.getElementsByTagName("main")[0]
    ).getPropertyValue('--paperBackgroundColor')

    window.ReactNativeWebView.postMessage(JSON.stringify({
      message: 'setBackgroundColor',
      color: color
    }))
  })
})();
`

export const tryProcessClouderyBackgroundMessage = (
  event: WebViewMessageEvent,
  setBackgroundColor: SetBackgroundColorCallback
): void => {
  const message = JSON.parse(event.nativeEvent.data) as ClouderyMessage

  if (message.message === 'setBackgroundColor' && message.color !== undefined) {
    setBackgroundColor(message.color.trim())
  }
}
