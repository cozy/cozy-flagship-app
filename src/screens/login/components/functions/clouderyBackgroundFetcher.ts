import { StatusBar } from 'react-native'
import type { StatusBarStyle } from 'react-native'
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

/**
 * Analyse backgroundColor luminosity and return true if it is a light background
 * or false if it is a dark background
 *
 * Based on "simple version" response from https://stackoverflow.com/a/41491220
 * We may need to implement the "advanced version" in the future if our partner
 * colors get more diveristy and to be aligned with W3C specs but for now
 * "simple version" should be enough
 *
 * @param backgroundColor - the background color to analyse
 * @returns true if it is a light background or false if it is a dark background
 */
const isLightBackground = (backgroundColor: string): boolean => {
  let color = backgroundColor.startsWith('#')
    ? backgroundColor.substring(1)
    : backgroundColor

  if (color.length === 3) {
    const r = color.substring(0)
    const g = color.substring(1)
    const b = color.substring(2)

    color = `${r}${r}${g}${g}${b}${b}`
  }

  const r = parseInt(color.substring(0, 2), 16) // hexToR
  const g = parseInt(color.substring(2, 4), 16) // hexToG
  const b = parseInt(color.substring(4, 6), 16) // hexToB
  return r * 0.299 + g * 0.587 + b * 0.114 > 186
}

export const setStatusBarColorToMatchBackground = (
  backgroundColor: string
): void => {
  const lightBackground = isLightBackground(backgroundColor)
  StatusBar.setBarStyle(lightBackground ? 'dark-content' : 'light-content')
}
