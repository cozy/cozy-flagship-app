import { useEffect } from 'react'
import { Linking } from 'react-native'

import CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'

import { handlePerformancesDeepLink } from '/app/domain/performances/deeplinkHandler'

const log = Minilog('usePerformancesUniversalLinks')

export const usePerformancesUniversalLinks = (client: CozyClient): void => {
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      log.debug(`🔗 Linking URL is ${url}`)
      if (handlePerformancesDeepLink(url, client)) {
        return
      }
    })

    return () => {
      subscription.remove()
    }
  }, [client])
}
