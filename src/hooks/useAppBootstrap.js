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

import { CameraRoll } from '@react-native-camera-roll/camera-roll'

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
          const { onboardUrl, fqdn } = onboardingParams

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
      } else {
        const payload = await Linking.getInitialURL()
        const { mainAppFallbackURL, cozyAppFallbackURL } =
          parseFallbackURL(payload)

        return setInitialRoute({
          route: routes.home,
          params: {
            mainAppFallbackURL,
            cozyAppFallbackURL
          }
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
        const { onboardUrl, fqdn } = onboardingParams

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

  // Photos Sync
  useEffect(() => {
    var upload = response => {
      var jobId = response.jobId
      console.log('UPLOAD HAS BEGUN! JobId: ' + jobId)
    }

    var uploadProgress = response => {
      var percentage = Math.floor(
        (response.totalBytesSent / response.totalBytesExpectedToSend) * 100
      )
      console.log('UPLOAD IS ' + percentage + '% DONE!')
    }

    const backupPhotos = async () => {
      const photos = await CameraRoll.getPhotos({
        first: 20,
        include: ['filename', 'fileExtension', 'location', 'imageSize']
      })

      for (var i = 0; i < photos.edges.length; i++) {
        console.log(
          `photo ${i} : ${p.node.group_name} / ${p.node.image.uri} / filename: ${p.node.image.filename} / extension: ${p.node.image.extension} / timestamp: ${p.node.timestamp} / location: ${p.node.location}`
        )
        await RNFS.uploadFiles({
          toUrl: uploadUrl,
          files: files,
          method: 'POST',
          headers: {
            Accept: 'application/json'
          },
          fields: {
            hello: 'world'
          },
          begin: uploadBegin,
          progress: uploadProgress
        }).promise
      }
    }

    backupPhotos().catch(e => {
      console.error(e)
    })
  }, [])
  return {
    client,
    initialRoute,
    isLoading
  }
}
