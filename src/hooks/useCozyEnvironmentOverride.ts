import { useEffect } from 'react'
import { Linking } from 'react-native'

import { extractEnvFromUrl } from './useCozyEnvironmentOverride.functions'

export const useCozyEnvironmentOverride = (): void => {
  useEffect(function CheckInitialUrl() {
    const doAsync = async (): Promise<void> => {
      const initialUrl = await Linking.getInitialURL()
      await extractEnvFromUrl(initialUrl)
    }

    void doAsync()
  }, [])

  useEffect(function InterceptDeepLink() {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      void extractEnvFromUrl(url)
    })

    return (): void => {
      subscription.remove()
    }
  }, [])
}
