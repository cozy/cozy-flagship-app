import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
  View
} from 'react-native'

import log from 'cozy-logger'

import { CozyIcon } from './transitions-icons/CozyIcon'

import { getColors } from '/ui/colors'

/**
 * Display a transition that should come before displaying the Authorize view
 *
 * @param {object} props
 * @param {string} props.backgroundColor - The LoginScreen's background color (used for overlay and navigation bars)
 * @param {Function} props.setTransitionEnded - Function to call when the transition ends
 * @returns {import('react').ComponentClass}
 */
export const TransitionToAuthorizeView = ({
  backgroundColor,
  setTransitionEnded
}) => {
  const colors = getColors()

  const animationDelayInSecond = 400
  const animationDurationInSecond = 200

  // we suppose the displayed Cozy logo is a square
  const targetSize =
    Platform.OS === 'ios' ? 1600 : Dimensions.get('window').width
  const targetTop = Dimensions.get('window').height / 2 - targetSize / 2
  const targetLeft = Dimensions.get('window').width / 2 - targetSize / 2

  const initialSize = 200
  const targetScale = Platform.OS === 'ios' ? initialSize / targetSize : 1 / 4

  const animatedScale = useRef(new Animated.Value(targetScale)).current
  const animatedOpacity = useRef(new Animated.Value(0)).current

  const [started, setStarted] = useState(false)

  const doTransition = useCallback(() => {
    return new Promise(resolve => {
      setStarted(true)

      animatedScale.setValue(targetScale)
      animatedOpacity.setValue(0)

      const opacityAnimation = Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: animationDurationInSecond,
        easing: Easing.ease,
        useNativeDriver: true
      })
      const scaleAnimation = Animated.timing(animatedScale, {
        toValue: 1,
        duration: animationDurationInSecond,
        easing: Easing.ease,
        useNativeDriver: true
      })

      const sequence = [
        Animated.delay(animationDelayInSecond),
        Animated.parallel([opacityAnimation, scaleAnimation])
      ]

      Animated.sequence(sequence).start(({ finished }) => {
        if (finished) {
          resolve()
        }
      })
    })
  }, [animatedOpacity, animatedScale, targetScale])

  useEffect(() => {
    if (!started) {
      doTransition()
        .then(setTransitionEnded)
        .catch(reason => log('error', reason.message))
    }
  }, [doTransition, started, setTransitionEnded])

  return (
    <Animated.View
      style={[
        styles.background,
        {
          backgroundColor: backgroundColor
        }
      ]}
    >
      <Animated.View
        style={[
          styles.cozyLogo,
          {
            top: targetTop,
            left: targetLeft,
            height: targetSize,
            width: targetSize,
            transform: [{ scaleX: animatedScale }, { scaleY: animatedScale }],
            display: 'none'
          }
        ]}
      >
        <View style={[styles.avatarContainer]}>
          <CozyIcon color={colors.paperBackgroundColor} />
        </View>
      </Animated.View>
      <Animated.View
        style={[
          styles.foreground,
          {
            opacity: animatedOpacity,
            backgroundColor: colors.paperBackgroundColor
          }
        ]}
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  foreground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  cozyLogo: {
    position: 'absolute'
  }
})
