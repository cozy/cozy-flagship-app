import LottieView, { AnimationObject } from 'lottie-react-native'
import React from 'react'
import { View, StyleSheet } from 'react-native'

import TwakeWorkplaceIcon from './TwakeWorkplaceIcon'
import contactsAnimation from './animations/contacts.json'
import defaultAnimation from './animations/default.json'
import driveAnimation from './animations/drive.json'
import notesAnimation from './animations/notes.json'
import storeAnimation from './animations/store.json'
import passwordsAnimation from './animations/passwords.json'

import { getColors } from '/ui/colors'

const AVAILABLE_ANIMATIONS: Record<string, AnimationObject> = {
  drive: driveAnimation,
  contacts: contactsAnimation,
  notes: notesAnimation,
  store: storeAnimation,
  passwords: passwordsAnimation,
  default: defaultAnimation
}

export const AnimatedIconScreen = ({ slug }: { slug: string }): JSX.Element => {
  const colors = getColors()

  return (
    <View
      style={{
        ...styles.container,
        backgroundColor: colors.paperBackgroundColor
      }}
    >
      <View style={styles.animationContainer}>
        <LottieView
          source={AVAILABLE_ANIMATIONS[slug] ?? AVAILABLE_ANIMATIONS.default}
          speed={0.75}
          style={styles.lottieView}
          autoPlay
          loop={false}
        />
      </View>
      <View style={styles.svgContainer}>
        <TwakeWorkplaceIcon />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%'
  },
  animationContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  lottieView: {
    width: '40%',
    height: '40%'
  },
  svgContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
