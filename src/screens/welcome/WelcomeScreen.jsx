import React, { useState } from 'react'
import { BackHandler, StyleSheet, Text, View } from 'react-native'

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
        source={{ html: makeHTML(WelcomePage) }}
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

export const CozyWelcomeScreen = ({ navigation, route, setClient }) => {
  const [isWelcomeModalDisplayed, setIsWelcomeModalDisplayed] = useState(true)

  const handleBackPress = () => {
    if (isWelcomeModalDisplayed) {
      BackHandler.exitApp()
    } else {
      setIsWelcomeModalDisplayed(true)
    }
  }

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
      {isWelcomeModalDisplayed && (
        <WelcomeView setIsWelcomeModalDisplayed={setIsWelcomeModalDisplayed} />
      )}
    </>
  )
}

export const OnboardingPartnerWelcomeScreen = ({ partner }) => {
  return (
    <View style={{ marginTop: 50, backgroundColor: '#000' }}>
      <Text>ONBOARDING PARTNER:</Text>
      <Text>- SOURCE: {partner.source}</Text>
      <Text>- CONTEXT: {partner.context}</Text>
    </View>
  )
}

export const WelcomeScreen = ({ navigation, route, setClient }) => {
  const { isInitialized, onboardingPartner } = useInstallReferrer()

  if (!isInitialized) return null

  if (onboardingPartner.hasReferral)
    return (
      <OnboardingPartnerWelcomeScreen
        navigation={navigation}
        partner={onboardingPartner}
        route={route}
        setClient={setClient}
      />
    )

  return (
    <CozyWelcomeScreen
      navigation={navigation}
      route={route}
      setClient={setClient}
    />
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
