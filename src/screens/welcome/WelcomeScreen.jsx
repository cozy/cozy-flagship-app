import React, { useState } from 'react'
import { BackHandler, StyleSheet, View } from 'react-native'

import { WelcomePage } from '/components/html/WelcomePage'
import { makeHTML } from '/components/makeHTML'
import { SupervisedWebView } from '/components/webviews/SupervisedWebView'
import { makeHandlers } from '/libs/functions/makeHandlers'
import { getColors } from '/ui/colors'
import { useDimensions } from '/libs/dimensions'
import { LoginScreen } from '/screens/login/LoginScreen'
import { useInstallReferrer } from '/screens/welcome/install-referrer/useInstallReferrer'

const WelcomeView = ({ setIsWelcomeModalDisplayed }) => {
  const colors = getColors()
  const dimensions = useDimensions()
  return (
    <View
      style={[
        styles.view,
        {
          backgroundColor: colors.primaryColor
        }
      ]}
    >
      <SupervisedWebView
        onMessage={makeHandlers({
          onContinue: () => setIsWelcomeModalDisplayed(false)
        })}
        originWhitelist={['*']}
        source={{ html: makeHTML(WelcomePage), baseUrl: '' }}
        style={{
          backgroundColor: colors.primaryColor
        }}
      />
      <View
        style={{
          height: dimensions.navbarHeight
        }}
      />
    </View>
  )
}

export const WelcomeScreen = ({ navigation, route, setClient }) => {
  const [isWelcomeModalDisplayed, setIsWelcomeModalDisplayed] = useState(true)
  const { isInitialized, onboardingPartner } = useInstallReferrer()

  const handleBackPress = () => {
    if (isWelcomeModalDisplayed || !onboardingPartner?.hasReferral) {
      BackHandler.exitApp()
    } else {
      setIsWelcomeModalDisplayed(true)
    }
  }

  if (!isInitialized) return null

  return (
    <>
      <LoginScreen
        style={styles.view}
        disabledFocus={isWelcomeModalDisplayed}
        navigation={navigation}
        route={route}
        setClient={setClient}
        goBack={handleBackPress}
      />
      {isWelcomeModalDisplayed && !onboardingPartner.hasReferral && (
        <WelcomeView setIsWelcomeModalDisplayed={setIsWelcomeModalDisplayed} />
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
