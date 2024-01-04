import Minilog from 'cozy-minilog'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { routes } from '/constants/routes'
import { consumeRouteParameter } from '/libs/functions/routeHelpers'
import { getColors } from '/ui/colors'
import { setStatusBarColorToMatchBackground } from '/screens/login/components/functions/clouderyBackgroundFetcher'

import { ClouderyCreateInstanceView } from './components/ClouderyCreateInstanceView'

const log = Minilog('CreateInstanceScreen')

const colors = getColors()

/**
 * Screen that should be displayed when openning an onboarding link from email
 *
 * The screen displays the Instance creation page at the link defined in the `onboard_url`
 * from the emailed link
 *
 * @param {object} props
 * @param {object} props.route - route param from react-router
 * @param {object} props.navigation - navigation param from react-router
 * @returns {import('react').ComponentClass}
 */
export const CreateInstanceScreen = ({ route, navigation }) => {
  const [clouderyUrl, setClouderyUrl] = useState()
  const [clouderyTheme, setClouderyTheme] = useState({
    backgroundColor: colors.onboardingBackgroundColor
  })

  const setClouderyThemeAndStatusBarColor = theme => {
    setStatusBarColorToMatchBackground(theme?.backgroundColor)
    setClouderyTheme(theme)
  }

  const startOnboarding = onboardingData => {
    const { fqdn, registerToken, magicCode } = onboardingData

    navigation.navigate(routes.onboarding, {
      registerToken,
      magicCode,
      fqdn,
      clouderyTheme
    })
  }

  useEffect(() => {
    const onboardUrl = consumeRouteParameter('onboardUrl', route, navigation)

    if (onboardUrl) {
      log.debug(`Open cloudery with onboardUrl: ${onboardUrl}`)

      setClouderyUrl(onboardUrl)
    }
  }, [navigation, route, setClouderyUrl])
  return (
    <View
      style={{
        ...styles.view,
        backgroundColor: clouderyTheme.backgroundColor
      }}
    >
      {clouderyUrl && (
        <ClouderyCreateInstanceView
          clouderyUrl={clouderyUrl}
          startOnboarding={startOnboarding}
          clouderyTheme={clouderyTheme}
          setClouderyTheme={setClouderyThemeAndStatusBarColor}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})
