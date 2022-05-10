import Minilog from '@cozy/minilog'
import { Linking } from 'react-native'
import { useEffect, useState } from 'react'

import strings from '../strings.json'
import { SentryTags, setSentryTag } from '../Sentry'
import { NetService } from '../libs/services/NetService'
import { manageIconCache } from '../libs/functions/iconTable'
import { navigate } from '../libs/RootNavigation'
import { routes } from '../constants/routes'
import { useSplashScreen } from './useSplashScreen'

const log = Minilog('useAppBootstrap')

const parseOnboardingURL = url => {
  try {
    if (!url || !url.includes('onboarding')) {
      return undefined
    }

    const onboardingUrl = new URL(url)
    const registerToken = onboardingUrl.searchParams.get('registerToken')
    const fqdn = onboardingUrl.searchParams.get('fqdn')

    if (!fqdn || !registerToken) {
      return undefined
    }

    return {
      registerToken,
      fqdn
    }
  } catch (error) {
    log.error(
      `Something went wrong while trying to parse onboarding URL data: ${error.message}`
    )
    return undefined
  }
}

const parseFallbackURL = url => {
  const defaultParse = { fallback: undefined, root: routes.stack }

  if (url === null) {
    return defaultParse
  }

  try {
    const makeURL = new URL(url)
    const fallback = makeURL.searchParams.get('fallback')
    const isHome = makeURL.pathname.split('/')[1] === 'home'

    return {
      fallback: fallback ? fallback : undefined,
      root: isHome || !fallback ? routes.stack : routes.cozyapp,
      isHome
    }
  } catch (error) {
    log.error(
      `Something went wrong while trying to parse fallback URL data: ${error.message}`
    )
    return defaultParse
  }
}

export const useAppBootstrap = (client, setClient) => {
  const [initialRoute, setInitialRoute] = useState('fetching')
  const [initialScreen, setInitialScreen] = useState('fetching')
  const [isLoading, setIsLoading] = useState(true)
  const { hideSplashScreen } = useSplashScreen()

  console.log('initialRoute', initialRoute)
  console.log('initialScreen', initialScreen)
  console.log('client', client)

  // Handling initial URL init
  useEffect(() => {
    if (
      client !== null &&
      initialRoute === 'fetching' &&
      initialScreen === 'fetching'
    ) {
      const doAsync = async () => {
        if (!client) {
          const onboardingUrl = await Linking.getInitialURL()

          if (await NetService.isOffline()) {
            NetService.toggleNetWatcher()

            setInitialRoute({
              stack: undefined,
              root: strings.errorScreens.offline
            })

            return setInitialScreen({
              stack: routes.authenticate,
              root: routes.error
            })
          }

          const onboardingParams = parseOnboardingURL(onboardingUrl)

          if (onboardingParams) {
            const { registerToken, fqdn } = onboardingParams

            setInitialRoute({ stack: undefined, root: undefined })

            return setInitialScreen({
              stack: routes.onboarding,
              root: routes.nested,
              params: {
                registerToken,
                fqdn
              }
            })
          } else {
            setInitialRoute({ stack: undefined, root: undefined })

            return setInitialScreen({
              stack: routes.authenticate,
              root: routes.stack
            })
          }
        } else {
          const payload = await Linking.getInitialURL()
          const { fallback, root, isHome } = parseFallbackURL(payload)

          setInitialScreen({ stack: routes.home, root })
          setInitialRoute({
            stack: isHome ? fallback : undefined,
            root: !isHome ? fallback : undefined
          })
        }
      }

      doAsync()
    }
  }, [initialRoute, initialScreen, client])

  // Handling app readiness
  useEffect(() => {
    if (client !== 'fetching' && initialRoute !== 'fetching' && isLoading) {
      setIsLoading(false)
      if (initialScreen.stack !== routes.home) {
        hideSplashScreen()
      }
    }
  }, [isLoading, initialRoute, client, hideSplashScreen, initialScreen.stack])

  // Handling post load side effects
  useEffect(() => {
    if (isLoading) {
      return
    }

    client && manageIconCache(client)
    client && setSentryTag(SentryTags.Instance, client.stackClient?.uri)

    const subscription = Linking.addEventListener('url', ({ url }) => {
      const onboardingParams = parseOnboardingURL(url)

      if (onboardingParams) {
        navigate(routes.onboarding, onboardingParams)
        return
      }

      const { fallback: href, isHome } = parseFallbackURL(url)

      if (href) {
        navigate(isHome ? routes.home : routes.cozyapp, { href })
        return
      }
    })

    return () => {
      subscription.remove()
    }
  }, [client, isLoading])

  return {
    client,
    initialRoute,
    initialScreen,
    isLoading,
    setClient
  }
}
