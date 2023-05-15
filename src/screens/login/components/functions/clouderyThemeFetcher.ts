import type { WebViewMessageEvent } from 'react-native-webview'

export interface ClouderyTheme {
  backgroundColor: string
  themeUrl: string | undefined
}

interface ClouderyMessage {
  message: string
  url?: string
  color?: string
}

type SetThemeUrlCallback = (theme: ClouderyTheme) => void

export const fetchThemeOnLoad = `
  window.addEventListener("load", function(event) {
    const links = document.querySelectorAll('head > link')
    const themeLink = [...links].find(c => c.href.includes('/theme') && c.media === 'screen')
    const color = getComputedStyle(
      document.getElementsByTagName("main")[0]
    ).getPropertyValue('--paperBackgroundColor')

    window.ReactNativeWebView.postMessage(JSON.stringify({
      message: 'setTheme',
      url: themeLink?.href,
      color: color
    }))
  })
`

export const tryProcessClouderyThemeMessage = (
  event: WebViewMessageEvent,
  setTheme: SetThemeUrlCallback
): void => {
  const message = JSON.parse(event.nativeEvent.data) as ClouderyMessage

  if (message.message === 'setTheme' && message.color !== undefined) {
    setTheme({
      themeUrl: message.url,
      backgroundColor: message.color.trim()
    })
  }
}
