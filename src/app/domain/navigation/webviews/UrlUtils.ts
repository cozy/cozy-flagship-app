import { Linking } from 'react-native'

import { webviewUrlLog } from '/app/domain/navigation/webviews/UrlModels'
import { getErrorMessage } from '/libs/functions/getErrorMessage'

/**
 * Check if url is not HTTP or HTTPS.
 * @param url - The URL to check
 * @returns boolean
 */
export const isHttpOrHttps = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://')
}

/**
 * Handle Non HTTP or HTTPS urls.
 * Be careful, this function expects a protocol that is not HTTP or HTTPS.
 * @param url - The URL to handle
 */
export const openUrlWithOs = async (url: string): Promise<void> => {
  try {
    await Linking.openURL(url)
  } catch (error) {
    webviewUrlLog.error(
      `Could not open url "${url}" with operating system`,
      getErrorMessage(error)
    )
  }
}
