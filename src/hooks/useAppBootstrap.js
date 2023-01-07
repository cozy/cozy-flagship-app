import Minilog from '@cozy/minilog'
import { Linking } from 'react-native'
import { useEffect, useState } from 'react'

import { SentryCustomTags, setSentryTag } from '/libs/monitoring/Sentry'
import { manageIconCache } from '/libs/functions/iconTable'
import { navigate } from '/libs/RootNavigation'
import { routes } from '/constants/routes'
import { useSplashScreen } from '/hooks/useSplashScreen'

const log = Minilog('useAppBootstrap')

const parseOnboardingURL = url => {
  try {
    if (!url || !url.includes('onboarding')) {
      return undefined
    }

    const onboardingUrl = new URL(url)
    const onboardUrl = onboardingUrl.searchParams.get('onboard_url')
    const fqdn = onboardingUrl.searchParams.get('fqdn')

    if (!onboardUrl && !fqdn) {
      return undefined
    }

    return {
      onboardUrl,
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

export const useAppBootstrap = client => {
  const [initialRoute, setInitialRoute] = useState('fetching')
  const [initialScreen, setInitialScreen] = useState('fetching')
  const [isLoading, setIsLoading] = useState(true)
  const { hideSplashScreen } = useSplashScreen()

  // Handling initial URL init
  useEffect(() => {
    const doAsync = async () => {
      if (!client) {
        const onboardingUrl = await Linking.getInitialURL()

        const onboardingParams = parseOnboardingURL(onboardingUrl)

        if (onboardingParams) {
          const { onboardUrl, fqdn } = onboardingParams

          if (onboardUrl) {
            setInitialRoute({ stack: undefined, root: undefined })

            return setInitialScreen({
              stack: routes.instanceCreation,
              root: routes.stack,
              params: {
                onboardUrl
              }
            })
          } else {
            setInitialRoute({ stack: undefined, root: undefined })

            return setInitialScreen({
              stack: routes.authenticate,
              root: routes.stack,
              params: {
                fqdn
              }
            })
          }
        } else {
          setInitialRoute({ stack: undefined, root: undefined })

          return setInitialScreen({
            stack: routes.welcome,
            root: routes.stack
          })
        }
      } else {
        const payload = await Linking.getInitialURL()
        const { fallback, root, isHome } = parseFallbackURL(payload)

        setInitialScreen({
          stack: routes.home,
          root
        })

        setInitialRoute({
          stack: isHome ? fallback : undefined,
          root: !isHome ? fallback : undefined
        })
      }
    }

    initialRoute === 'fetching' && initialScreen === 'fetching' && doAsync()
  }, [client, initialRoute, initialScreen, hideSplashScreen])

  // Handling app readiness
  useEffect(() => {
    if (initialRoute !== 'fetching' && isLoading) {
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
    client && setSentryTag(SentryCustomTags.Instance, client.stackClient?.uri)

    const subscription = Linking.addEventListener('url', ({ url }) => {
      const onboardingParams = parseOnboardingURL(url)

      if (onboardingParams) {
        const { onboardUrl, fqdn } = onboardingParams

        if (onboardUrl) {
          navigate(routes.instanceCreation, { onboardUrl })
          return
        } else {
          navigate(routes.authenticate, { fqdn })
          return
        }
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
    isLoading
  }
}
