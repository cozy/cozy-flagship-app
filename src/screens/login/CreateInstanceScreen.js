import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Platform } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Minilog from '@cozy/minilog'

import { routes } from '/constants/routes'

import { getNavbarHeight, statusBarHeight } from '/libs/dimensions'
import { consumeRouteParameter } from '/libs/functions/routeHelpers'

import { getColors } from '/theme/colors'

import { ClouderyCreateInstanceView } from './components/ClouderyCreateInstanceView'

const log = Minilog('CreateInstanceScreen')

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

  const startOnboarding = onboardingData => {
    const { fqdn, registerToken } = onboardingData

    navigation.navigate(routes.onboarding, {
      registerToken,
      fqdn
    })
  }

  useEffect(() => {
    const onboardUrl = consumeRouteParameter('onboardUrl', route, navigation)

    if (onboardUrl) {
      log.debug(`Open cloudery with onboardUrl: ${onboardUrl}`)

      setClouderyUrl(onboardUrl)
    }
  }, [navigation, route, setClouderyUrl])
  const insets = useSafeAreaInsets()
  return (
    <View style={styles.view}>
      <View style={{ height: statusBarHeight }} />
      {clouderyUrl && (
        <ClouderyCreateInstanceView
          clouderyUrl={clouderyUrl}
          startOnboarding={startOnboarding}
        />
      )}
      <View
        style={{
          height: Platform.OS === 'ios' ? insets.bottom : getNavbarHeight()
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: getColors().primaryColor
  }
})
