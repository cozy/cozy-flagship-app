import { useEffect } from 'react'
import { Linking } from 'react-native'

import CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'

import { handleDbDeepLink } from '/pouchdb/deeplinkHandler'

const log = Minilog('useOfflineDebugUniversalLinks')

export const useOfflineDebugUniversalLinks = (client: CozyClient): void => {
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      log.debug(`🔗 Linking URL is ${url}`)
      if (handleDbDeepLink(url, client)) {
        return
      }
    })

    return () => {
      subscription.remove()
    }
  }, [client])
}
