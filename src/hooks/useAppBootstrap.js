import Minilog from 'cozy-minilog'
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
  parseOnboardLink
} from '/app/domain/deeplinks/services/DeeplinksParserService'
import { useSplashScreen } from '/hooks/useSplashScreen'
import { formatRedirectLink } from '/libs/functions/formatRedirectLink'
import {
  getOrFetchDefaultRedirectionUrl,
  getParamsWithDefaultRedirectionUrl
} from '/libs/defaultRedirection/defaultRedirection'
import { useHomeStateContext } from '/screens/home/HomeStateProvider'

const log = Minilog('useAppBootstrap')

export const useAppBootstrap = client => {
  const [initialRoute, setInitialRoute] = useState('fetching')
  const [isLoading, setIsLoading] = useState(true)
  const { hideSplashScreen } = useSplashScreen()
  const { onboardedRedirection, setOnboardedRedirection } =
    useHomeStateContext()

  // Handling initial URL init
  useEffect(() => {
    const doAsync = async () => {
      if (!client) {
        const onboardingUrl = await Linking.getInitialURL()
        log.debug(`App's initialURL is ${onboardingUrl}`)

        const action = parseOnboardLink(onboardingUrl)

        if (action) {
          if (action.onboardedRedirection) {
            log.debug(
              `Set OnboardedRedirection to ${action.onboardedRedirection}`
            )
            setOnboardedRedirection(action.onboardedRedirection)
          }

          log.debug(
            `Set initialRoute to ${action.route} screen, ${
              action.params.magicCode ? 'with magic code' : ''
            }`
          )
          return setInitialRoute({
            route: action.route,
            params: action.params
          })
        } else {
          log.debug('Set initialRoute to welcome screen')
          return setInitialRoute({
            route: routes.welcome
          })
        }
      } else if (onboardedRedirection) {
        const onboardingRedirectionURL = formatRedirectLink(
          onboardedRedirection,
          client
        )

        setOnboardedRedirection('')

        log.debug(
          `Set initialRoute to home screen with fallback on ${onboardingRedirectionURL}`
        )

        // Temporary code to fix onboarding redirection = 'home%2Fintro'
        // We should find a cleaner way to do this
        let cozyAppFallbackURL = null
        let mainAppFallbackURL = null
        if (onboardedRedirection.startsWith('home/')) {
          mainAppFallbackURL = onboardingRedirectionURL
        } else {
          cozyAppFallbackURL = onboardingRedirectionURL
        }

        return setInitialRoute({
          route: routes.home,
          params: {
            mainAppFallbackURL,
            cozyAppFallbackURL
          }
        })
      } else {
        const payload = await Linking.getInitialURL()
        const { mainAppFallbackURL, cozyAppFallbackURL } =
          parseFallbackURL(payload)
        if (mainAppFallbackURL || cozyAppFallbackURL) {
          log.debug(
            `Set initialRoute to home screen with fallback params from initialURL ${{
              mainAppFallbackURL,
              cozyAppFallbackURL
            }}`
          )
          return setInitialRoute({
            route: routes.home,
            params: {
              mainAppFallbackURL,
              cozyAppFallbackURL
            }
          })
        }

        const defaultRedirectUrl = await getOrFetchDefaultRedirectionUrl(client)

        log.debug(
          `Set initialRoute to home screen with fallback from database ${defaultRedirectUrl}`
        )
        return setInitialRoute({
          route: routes.home,
          params: getParamsWithDefaultRedirectionUrl(defaultRedirectUrl, client)
        })
      }
    }

    initialRoute === 'fetching' && doAsync()
  }, [
    client,
    initialRoute,
    hideSplashScreen,
    onboardedRedirection,
    setOnboardedRedirection
  ])

  // Handling app readiness
  useEffect(() => {
    if (initialRoute !== 'fetching' && isLoading) {
      setIsLoading(false)
      if (initialRoute.route !== routes.home) {
        log.debug('useAppBootstrap: hideSplashScreen')
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
      log.debug(`🔗 Linking URL is ${url}`)

      if (!client) {
        const action = parseOnboardLink(url)

        if (action) {
          if (action.onboardedRedirection) {
            log.debug(
              `Set OnboardedRedirection to ${action.onboardedRedirection}`
            )
            setOnboardedRedirection(action.onboardedRedirection)
          }

          log.debug(`🔗 Redirect to ${action.route} screen`)
          navigate(action.route, action.params)
          return
        }
      } else {
        const { mainAppFallbackURL, cozyAppFallbackURL } = parseFallbackURL(url)

        if (mainAppFallbackURL || cozyAppFallbackURL) {
          const href = mainAppFallbackURL || cozyAppFallbackURL

          const subdomainType = client.capabilities?.flat_subdomains
            ? 'flat'
            : 'nested'
          const { slug } = deconstructCozyWebLinkWithSlug(href, subdomainType)

          const iconParams = getDefaultIconParams()

          const route = mainAppFallbackURL ? routes.home : routes.cozyapp

          log.debug(`🔗 Redirect to ${route} screen (fallback)`)
          navigate(route, {
            href,
            slug,
            iconParams
          })
          return
        }
      }
    })

    return () => {
      subscription.remove()
    }
  }, [client, isLoading, setOnboardedRedirection])

  return {
    client,
    initialRoute,
    isLoading
  }
}
