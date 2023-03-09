import { Linking } from 'react-native'
import { useEffect, useState } from 'react'

import { deconstructCozyWebLinkWithSlug } from 'cozy-client'

import { SentryCustomTags, setSentryTag } from '/libs/monitoring/Sentry'
import { manageIconCache } from '/libs/functions/iconTable'
import { getDefaultIconParams } from '/libs/functions/openApp'
import { navigate } from '/libs/RootNavigation'
import { routes } from '/constants/routes'
import {
  parseFallbackURL,
  parseOnboardingURL
} from '/hooks/useAppBootstrap.functions'
import { useSplashScreen } from '/hooks/useSplashScreen'
import { formatRedirectLink } from '/libs/functions/formatRedirectLink'
import {
  getOrFetchDefaultRedirectionUrl,
  getParamsWithDefaultRedirectionUrl
} from '/libs/defaultRedirection/defaultRedirection'

let OnboardingRedirection = ''

export const useAppBootstrap = client => {
  const [initialRoute, setInitialRoute] = useState('fetching')
  const [isLoading, setIsLoading] = useState(true)
  const { hideSplashScreen } = useSplashScreen()

  // Handling initial URL init
  useEffect(() => {
    const doAsync = async () => {
      if (!client) {
        const onboardingUrl = await Linking.getInitialURL()

        const onboardingParams = parseOnboardingURL(onboardingUrl)

        if (onboardingParams) {
          const { onboardUrl, onboardedRedirection, fqdn } = onboardingParams

          if (onboardedRedirection) {
            OnboardingRedirection = onboardedRedirection
          }

          if (onboardUrl) {
            return setInitialRoute({
              route: routes.instanceCreation,
              params: {
                onboardUrl
              }
            })
          } else {
            return setInitialRoute({
              route: routes.authenticate,
              params: {
                fqdn
              }
            })
          }
        } else {
          return setInitialRoute({
            route: routes.welcome
          })
        }
      } else if (OnboardingRedirection) {
        const onboardingRedirectionURL = formatRedirectLink(
          OnboardingRedirection,
          client
        )

        OnboardingRedirection = ''

        return setInitialRoute({
          route: routes.home,
          params: {
            cozyAppFallbackURL: onboardingRedirectionURL
          }
        })
      } else {
        const payload = await Linking.getInitialURL()
        const { mainAppFallbackURL, cozyAppFallbackURL } =
          parseFallbackURL(payload)
        if (mainAppFallbackURL || cozyAppFallbackURL) {
          return setInitialRoute({
            route: routes.home,
            params: {
              mainAppFallbackURL,
              cozyAppFallbackURL
            }
          })
        }

        const defaultRedirectUrl = await getOrFetchDefaultRedirectionUrl(client)

        return setInitialRoute({
          route: routes.home,
          params: getParamsWithDefaultRedirectionUrl(defaultRedirectUrl, client)
        })
      }
    }

    initialRoute === 'fetching' && doAsync()
  }, [client, initialRoute, hideSplashScreen])

  // Handling app readiness
  useEffect(() => {
    if (initialRoute !== 'fetching' && isLoading) {
      setIsLoading(false)
      if (initialRoute.route !== routes.home) {
        hideSplashScreen()
      }
    }
  }, [isLoading, initialRoute, client, hideSplashScreen, initialRoute.route])

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
        const { onboardUrl, onboardedRedirection, fqdn } = onboardingParams

        if (onboardedRedirection && !client) {
          OnboardingRedirection = onboardedRedirection
        }

        if (onboardUrl) {
          navigate(routes.instanceCreation, { onboardUrl })
          return
        } else {
          navigate(routes.authenticate, { fqdn })
          return
        }
      }

      const { mainAppFallbackURL, cozyAppFallbackURL } = parseFallbackURL(url)

      if (mainAppFallbackURL || cozyAppFallbackURL) {
        const href = mainAppFallbackURL || cozyAppFallbackURL

        const subdomainType = client.capabilities?.flat_subdomains
          ? 'flat'
          : 'nested'
        const { slug } = deconstructCozyWebLinkWithSlug(href, subdomainType)

        const iconParams = getDefaultIconParams()

        navigate(mainAppFallbackURL ? routes.home : routes.cozyapp, {
          href,
          slug,
          iconParams
        })
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
    isLoading
  }
}
