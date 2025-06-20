import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native'

import Minilog from 'cozy-minilog'

import { getDimensions } from '/libs/dimensions'
import { getErrorMessage } from '/libs/functions/getErrorMessage'
import { isLightBackground } from '/screens/login/components/functions/clouderyBackgroundFetcher'
import { getColors } from '/ui/colors'
import { CozyIcon } from '/screens/login/components/transitions/transitions-icons/CozyIcon'
import { palette } from '/ui/palette'

const log = Minilog('TransitionToPasswordView')

const webViewTopToNativeTop = top => top + getDimensions().statusBarHeight

const colors = getColors()

/**
 * Display a transition that should come before displaying the PasswordView
 *
 * This transition should know where is the password form's avatar in order to
 * correctly translate the Cozy logo to the avatar's position
 *
 * @param {object} props
 * @param {string} props.backgroundColor - The LoginScreen's background color (used for overlay and navigation bars)
 * @param {TransitionPasswordAvatarPosition} props.passwordAvatarPosition - The password form's avatar position
 * @param {boolean} props.requestTransitionStart - Boolean that define if the transition should start
 * @param {Function} props.setTransitionEnded - Function to call when the transition ends
 * @returns {import('react').ComponentClass}
 */
export const TransitionToPasswordView = ({
  backgroundColor,
  passwordAvatarPosition,
  requestTransitionStart,
  setTransitionEnded
}) => {
  const animationDelayInSecond = 200
  const animationDurationInSecond = 400
  const fadeOutDurationInSecond = 200

  const initialHeight = 200
  const initialWidth = 200

  const initialTop = Dimensions.get('window').height / 2 - initialHeight / 2
  const initialLeft = Dimensions.get('window').width / 2 - initialWidth / 2

  const animatedTranslateY = useRef(new Animated.Value(0)).current
  const animatedScale = useRef(new Animated.Value(1)).current
  const animatedOpacity = useRef(new Animated.Value(1)).current

  const [foregroundColor, setForegroundColor] = useState(palette.Common.white)

  useEffect(() => {
    if (requestTransitionStart) {
      transitionToFinal(passwordAvatarPosition)
        .then(setTransitionEnded)
        .catch(reason => log('error', reason.message))
    }
  }, [
    passwordAvatarPosition,
    requestTransitionStart,
    setTransitionEnded,
    transitionToFinal
  ])

  useEffect(() => {
    try {
      const shouldUsePrimaryColor = isLightBackground(backgroundColor)

      const color = shouldUsePrimaryColor
        ? colors.primaryColor
        : palette.Common.white

      setForegroundColor(color)
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      log.error(
        `Something went wrong while trying to check if isLightBackground: ${errorMessage}`
      )
    }
  }, [backgroundColor])

  const transitionToFinal = useCallback(
    targetPosition => {
      return new Promise(resolve => {
        let { boxHeight, top, height } = targetPosition

        const targetScale = height / initialHeight

        const translationBeforeScale = webViewTopToNativeTop(top) - initialTop
        const translationCompensationFromScale = (initialHeight - boxHeight) / 2
        const targetTranslateY =
          translationBeforeScale - translationCompensationFromScale

        const targetBackgroundOpacity = 0

        const translateAnimation = Animated.timing(animatedTranslateY, {
          toValue: targetTranslateY,
          duration: animationDurationInSecond,
          easing: Easing.bezier(0.7, -0.4, 0.4, 1.4),
          useNativeDriver: true
        })

        const scaleAnimation = Animated.timing(animatedScale, {
          toValue: targetScale,
          duration: animationDurationInSecond,
          easing: Easing.bezier(0.7, -0.4, 0.4, 1.4),
          useNativeDriver: true
        })

        const opacityAnimation = Animated.timing(animatedOpacity, {
          toValue: targetBackgroundOpacity,
          duration: fadeOutDurationInSecond,
          useNativeDriver: true
        })

        const sequence = [
          Animated.delay(animationDelayInSecond),
          Animated.parallel([translateAnimation, scaleAnimation]),
          opacityAnimation
        ]

        Animated.sequence(sequence).start(({ finished }) => {
          if (finished) {
            resolve()
          }
        })
      })
    },
    [animatedOpacity, animatedScale, animatedTranslateY, initialTop]
  )

  return (
    <Animated.View style={styles.container}>
      <Animated.View
        style={[
          styles.background,
          {
            opacity: animatedOpacity,
            backgroundColor: backgroundColor
          }
        ]}
      />
      <Animated.View
        style={[
          styles.avatar,
          {
            top: initialTop,
            left: initialLeft,
            height: initialHeight,
            width: initialWidth,
            transform: [
              { translateY: animatedTranslateY },
              { scaleX: animatedScale },
              { scaleY: animatedScale }
            ],
            display: 'none'
          }
        ]}
      >
        <View style={[styles.avatarContainer]}>
          <CozyIcon color={foregroundColor} />
        </View>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  avatar: {
    position: 'absolute'
  },
  avatarContainer: {
    padding: 30
  }
})
