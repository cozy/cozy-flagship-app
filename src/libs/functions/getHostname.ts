import { getErrorMessage } from 'cozy-intent'

import { devlog } from '/core/tools/env'

export const getHostname = (
  nativeEvent?: { url?: string | unknown } | unknown
): string | undefined => {
  if (
    !nativeEvent ||
    typeof nativeEvent !== 'object' ||
    !('url' in nativeEvent) ||
    typeof nativeEvent.url !== 'string'
  )
    return

  try {
    return new URL(nativeEvent.url).hostname
  } catch (error) {
    devlog('getHostname failed, nativeEvent:', nativeEvent, error)
    if (getErrorMessage(error).includes('Invalid URL')) return nativeEvent.url
  }
}
