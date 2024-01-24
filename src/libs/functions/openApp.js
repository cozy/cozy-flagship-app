import { Alert, Linking, Platform } from 'react-native'
import { useMemo } from 'react'

import { Q } from 'cozy-client'

import { getDimensions } from '/libs/dimensions'
import { isSameCozy, openUrlInAppBrowser } from '/libs/functions/urlHelpers'
import { navigate } from '/libs/RootNavigation'
import { routes } from '/constants/routes'
/**
 * App's mobile information. Used to describe the app scheme and its store urls
 * @typedef {object} AppManifestMobileInfo
 * @property {string} schema - The app's URL scheme
 * @property {string} id_playstore - The app's id on Google PlayStore
 * @property {string} id_appstore - The app's id on Apple AppStore
 */

/**
 * App's description resulting of its manifest.webapp file
 * @typedef {object} AppManifest
 * @property {string} slug - The app's slug
 * @property {AppManifestMobileInfo} mobile - The app's mobile information
 */

/**
 * Apps mobile information that can be used as a fallback if the Cozy
 * still has an old version of the app which doesn't describe its mobile
 * info on the manifest.webapp
 *
 * This object is used for retro-compatibility support and may be deleted
 * in the future
 *
 * If a new schema is inserted into this array or if a new app describe its
 * schema in its manifest.webapp, then AndroidManifest.xml and Info.plist
 * should be updated with the scheme permission
 *
 * @type {Array.<AppManifestMobileInfo>}
 */
const slugFallbacks = {
  passwords: {
    schema: 'cozypass://',
    id_playstore: 'io.cozy.pass',
    id_appstore: 'cozy-pass/id1502262449'
  }
}

/**
 * Manage custom behavior for mobile app
 * Open the native mobile app if no custom behavior
 * @param {import("cozy-client/dist/index").CozyClient} client - CozyClient instance
 * @param {any} navigation - The React navigation context
 * @param {string} href - The app web url
 * @param {AppManifest} app - The app information
 * @param {DOMRect | undefined} iconParams - Icon position and size
 * @returns {Promise}
 */
const mobileDispatcher = async (client, navigation, href, app, iconParams) => {
  if (app.slug === 'passwords') {
    try {
      const {
        data: { extension_installed: isVaultConfigured }
      } = await client.fetchQueryAndGetFromState({
        definition: Q('io.cozy.settings').getById('io.cozy.settings.bitwarden'),
        options: {
          as: 'io.cozy.settings/io.cozy.settings.bitwarden',
          singleDocData: true
        }
      })

      if (isVaultConfigured) {
        return openAppNative(app.mobile)
      } else {
        return navigateToApp({ navigation, href, slug: app.slug, iconParams })
      }
    } catch {
      return openAppNative(app.mobile)
    }
  }

  return openAppNative(app.mobile)
}

/**
 * Open the native mobile app using app scheme passed in arguments
 * If app is not installed, redirect the user to the mobile store
 * @param {AppManifestMobileInfo} appNativeData - The app's mobile information
 * @returns {Promise}
 */
const openAppNative = async appNativeData => {
  const schema = appNativeData.schema

  const canOpenApp = await Linking.canOpenURL(schema)

  if (canOpenApp) {
    return Linking.openURL(schema)
  } else {
    return new Promise(resolve => {
      const idPlayStore = appNativeData.id_playstore
      const idAppStore = appNativeData.id_appstore

      const storeUrl =
        Platform.OS === 'ios'
          ? `itms-apps://apps.apple.com/id/app/${idAppStore}?l=id`
          : `https://play.google.com/store/apps/details?id=${idPlayStore}`

      const storeName = Platform.OS === 'ios' ? 'AppStore' : 'PlayStore'

      Alert.alert(
        'Open Store', // TODO: Translate
        `You will be redirected to the ${storeName}. Do you want to continue?`, // TODO: Translate
        [
          {
            text: 'Cancel', // TODO: Translate
            onPress: resolve,
            style: 'cancel'
          },
          {
            text: `Open the ${storeName}`, // TODO: Translate
            onPress: () => Linking.openURL(storeUrl).then(resolve)
          }
        ],
        {
          cancelable: true,
          onDismiss: resolve
        }
      )
    })
  }
}

/**
 * Open the konnector pane in the Home view
 * @param {AppManifest} konnector - The konnector information
 */
const openKonnectorInHome = konnector => {
  const { slug } = konnector

  navigate({
    name: routes.default,
    params: {
      konnector: slug
    }
  })
}

/**
 * Open the native mobile app if the app has a mobile version
 * Otherwise open the app on a webview using href if the href belongs to the Cozy.
 * Otherwise open the href inside an InAppBrowser
 * @param {import("cozy-client/dist/index").CozyClient} client - CozyClient instance
 * @param {any} navigation - The React navigation context
 * @param {string} href - The app web url
 * @param {AppManifest} app - The app information
 * @param {DOMRect | undefined} iconParams - Icon position and size
 * @returns {Promise}
 */
export const openApp = (client, navigation, href, app, iconParams) => {
  const subDomainType = client.capabilities?.flat_subdomains ? 'flat' : 'nested'

  if (app?.type === 'konnector') {
    openKonnectorInHome(app) // Always let Konnectors go through, they don't have a href so they would fail the shouldOpenInIAB check
    return
  }

  const shouldOpenInIAB = !isSameCozy({
    cozyUrl: client.getStackClient().uri,
    destinationUrl: href,
    subDomainType
  })

  if (shouldOpenInIAB) {
    openUrlInAppBrowser(href)
    return
  }

  if (app?.mobile) {
    return mobileDispatcher(client, navigation, href, app, iconParams)
  }

  if (app?.slug) {
    const slugFallback = slugFallbacks[app.slug]

    if (slugFallback) {
      return openAppNative(slugFallback)
    }
  }

  return navigateToApp({ navigation, href, slug: app?.slug, iconParams })
}

export const getDefaultIconParams = () => {
  console.log('💜 getDimensions() from getDefaultIconParams')
  const { screenWidth, screenHeight } = getDimensions()

  return {
    x: screenWidth * 0.5 - 32 * 0.5,
    y: screenHeight * 0.5 - 32 * 0.5,
    width: 32,
    height: 32
  }
}

/**
 * Open the app in the Home view
 * @param {any} navigation - The React navigation context
 * @param {string} href - The app web url
 * @param {string} slug - The app slug
 * @param {DOMRect | undefined} iconParams - Icon position and size
 * @returns {Promise}
 * @example
 * navigateToApp({ navigation, href: 'https://drive.cozy.tools', slug: 'drive' })
 *
 * */
export const navigateToApp = ({ navigation, href, slug, iconParams }) => {
  return navigation.navigate('cozyapp', {
    href,
    iconParams:
      (iconParams && typeof iconParams !== 'object'
        ? JSON.parse(iconParams)
        : iconParams) || getDefaultIconParams(),
    slug
  })
}

/**
 * Memoized default icon params as a React hook
 * It will return the icon params centered on both axis on the screen
 * @returns {import('/constants/route-types').IconParams}
 */
export const useDefaultIconParams = () => {
  console.log('💜 getDimensions() from useDefaultIconParams')
  const { screenWidth, screenHeight } = getDimensions()

  return useMemo(() => {
    return {
      x: screenWidth * 0.5 - 32 * 0.5,
      y: screenHeight * 0.5 - 32 * 0.5,
      width: 32,
      height: 32
    }
  }, [screenWidth, screenHeight])
}
