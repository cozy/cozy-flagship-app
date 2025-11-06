import { NavigationProp, RouteProp } from '@react-navigation/native'
import React, { useState, useMemo } from 'react'
import { BackHandler, StyleSheet, View } from 'react-native'

import type CozyClient from 'cozy-client'
import { FlagshipUI } from 'cozy-intent'

import { ScreenIndexes, useFlagshipUI } from '/app/view/FlagshipUI'
import { WelcomePage } from '/components/html/WelcomePage'
import { makeHTML } from '/components/makeHTML'
import { SupervisedWebView } from '/components/webviews/SupervisedWebView'
import { makeHandlers } from '/libs/functions/makeHandlers'
import { getColors } from '/ui/colors'
import {
  CLOUDERY_MODE_LOGIN,
  CLOUDERY_MODE_SIGNING
} from '/screens/login/components/ClouderyViewSwitch'
import { LoginScreen } from '/screens/login/LoginScreen'
import { useInstallReferrer } from '/screens/welcome/install-referrer/useInstallReferrer'
import { useWelcomeInit } from '/app/view/Welcome/useWelcomeInit'
import { ErrorTokenModal } from '/app/view/Auth/ErrorTokenModal'
import { handleSupportEmail } from '/app/domain/authentication/services/AuthService'
import { useClouderyType } from '/screens/login/cloudery-env/useClouderyType'
import { getColorScheme } from '/app/theme/colorScheme'

interface WelcomeViewProps {
  setIsWelcomeModalDisplayed: (value: boolean) => void
  setClouderyMode: (value: string) => void
}

const WelcomeView = ({
  setIsWelcomeModalDisplayed,
  setClouderyMode
}: WelcomeViewProps): JSX.Element => {
  const colors = getColors()
  return (
    <View
      style={[
        styles.view,
        {
          backgroundColor: colors.paperBackgroundColor
        }
      ]}
    >
      <SupervisedWebView
        onMessage={makeHandlers({
          onSignin: () => {
            setClouderyMode(CLOUDERY_MODE_SIGNING)
            setIsWelcomeModalDisplayed(false)
          },
          onLogin: () => {
            setClouderyMode(CLOUDERY_MODE_LOGIN)
            setIsWelcomeModalDisplayed(false)
          }
        })}
        originWhitelist={['*']}
        source={{ html: makeHTML(WelcomePage), baseUrl: '' }}
        style={{
          backgroundColor: colors.paperBackgroundColor
        }}
      />
    </View>
  )
}

interface WelcomeScreenProps {
  navigation: NavigationProp<Record<string, unknown>>
  route: RouteProp<Record<string, Record<string, unknown> | undefined>, string>
  setClient: (client: CozyClient) => void
}

export const WelcomeScreen = ({
  navigation,
  route,
  setClient
}: WelcomeScreenProps): JSX.Element | null => {
  useWelcomeInit()
  const [isWelcomeModalDisplayed, setIsWelcomeModalDisplayed] = useState(true)
  const { isInitialized, onboardingPartner } = useInstallReferrer()
  const [clouderyMode, setClouderyMode] = useState(CLOUDERY_MODE_LOGIN)
  const clouderyType = useClouderyType()

  const defaultFlagshipUI: FlagshipUI = useMemo(() => {
    const colorScheme = getColorScheme()
    const theme = colorScheme === 'dark' ? 'light' : 'dark'
    return {
      bottomTheme: theme,
      topTheme: theme
    }
  }, [])

  useFlagshipUI(
    'WelcomeScreen',
    ScreenIndexes.WELCOME_SCREEN,
    defaultFlagshipUI
  )

  const handleBackPress = (): void => {
    if (isWelcomeModalDisplayed || onboardingPartner?.hasReferral) {
      BackHandler.exitApp()
    } else {
      setIsWelcomeModalDisplayed(true)
    }
  }

  if (!isInitialized) return null

  if (!clouderyType.type) return null

  return (
    <>
      <LoginScreen
        clouderyMode={clouderyMode}
        clouderyType={clouderyType.type}
        // @ts-expect-error: the LoginScreen component is not typed
        style={styles.view}
        disableAutofocus={isWelcomeModalDisplayed}
        navigation={navigation}
        route={route}
        setClient={setClient}
        goBack={handleBackPress}
      />

      {route.params?.options === 'showTokenError' && (
        <ErrorTokenModal
          onClose={(): void => navigation.setParams({ options: '' })}
          handleEmail={handleSupportEmail}
        />
      )}

      {isWelcomeModalDisplayed &&
        !onboardingPartner?.hasReferral &&
        clouderyType.type !== 'twake' && (
          <WelcomeView
            setIsWelcomeModalDisplayed={setIsWelcomeModalDisplayed}
            setClouderyMode={setClouderyMode}
          />
        )}
    </>
  )
}

const styles = StyleSheet.create({
  view: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  }
})
