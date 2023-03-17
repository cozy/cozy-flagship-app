import React, { useState } from 'react'
import { BackHandler, StyleSheet } from 'react-native'

import { LoginScreen } from '/screens/login/LoginScreen'
import { useInstallReferrer } from '/screens/welcome/install-referrer/useInstallReferrer'
import { WelcomeView } from '/screens/welcome/view/WelcomeView'

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
        <WelcomeView onContinue={setIsWelcomeModalDisplayed} />
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
