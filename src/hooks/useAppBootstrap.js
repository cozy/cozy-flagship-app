import { Linking, Platform } from 'react-native'
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
import RNFS from 'react-native-fs'
import { backgroundUpload, getRealPath } from 'react-native-compressor'
import InAppBrowser from 'react-native-inappbrowser-reborn'

export const useAppBootstrap = client => {
  const [initialRoute, setInitialRoute] = useState('fetching')
  const [isLoading, setIsLoading] = useState(true)
  const { hideSplashScreen } = useSplashScreen()

  // Handling initial URL init
  useEffect(() => {
    InAppBrowser.open('http://localhost:8126')
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
    var uploadBegin = response => {
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
        first: 1,
        include: ['filename', 'fileExtension', 'location', 'imageSize']
      })
      console.log('TOKEN', client.getStackClient().token)
      for (var i = 0; i < photos.edges.length; i++) {
        console.log(
          `photo ${i} : ${photos.edges[i].node.group_name} / ${photos.edges[i].node.image.uri} / filename: ${photos.edges[i].node.image.filename} / extension: ${photos.edges[i].node.image.extension} / timestamp: ${photos.edges[i].node.timestamp} / location: ${photos.edges[i].node.location}`
        )

        if (Platform.OS === 'ios') {
          const filepath = await RNFS.copyAssetsFileIOS(
            photos.edges[i].node.image.uri,
            RNFS.TemporaryDirectoryPath + photos.edges[i].node.image.filename,
            0,
            0
          )
          console.log('filepath', filepath)
          const realPath = await getRealPath(
            photos.edges[i].node.image.uri,
            'video'
          )
          console.log('realPath', realPath)
          const createdAt = new Date(
            photos.edges[i].node.timestamp * 1000
          ).toISOString()
          const toURL =
            client.getStackClient().uri +
            '/files/io.cozy.files.root-dir' +
            '?Name=' +
            encodeURIComponent(photos.edges[i].node.image.filename) +
            '&Type=file&Tags=library&Executable=false&CreatedAt=' +
            createdAt +
            '&UpdatedAt=' +
            createdAt
          try {
            /* const r = await RNFS.uploadFiles({
              toUrl: toURL,

              files: [
                {
                  filename: photos.edges[i].node.image.filename,
                  filepath
                }
              ],
              method: 'POST',
              headers: {
                Accept: 'application/json',
                Authorization:
                  'Bearer ' + client.getStackClient().token.accessToken
              },
              begin: uploadBegin,
              progress: uploadProgress
            })
            const uploadPromise = await r
            const promiseResult = await uploadPromise.promise
            console.log('promiseResult', promiseResult) */

            const headers = {
              Accept: 'application/json',
              Authorization:
                'Bearer ' + client.getStackClient().token.accessToken
            }

            const uploadResult = await backgroundUpload(
              toURL,
              realPath,
              { httpMethod: 'POST', headers },
              (written, total) => {
                console.log(written, total)
              }
            )
            console.log('uploadResult', uploadResult)
          } catch (e) {
            console.log('error', e)
          }
        }
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
