import React, { useCallback, useEffect, useRef } from 'react'
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native'

import log from 'cozy-logger'

import { getDimensions } from '/libs/dimensions'

import { CozyIcon } from './transitions-icons/CozyIcon'

import { getColors } from '/ui/colors'

const webViewTopToNativeTop = top => top + getDimensions().statusBarHeight

/**
 * Display a transition that should come before displaying the PasswordView
 *
 * This transition should know where is the password form's avatar in order to
 * correctly translate the Cozy logo to the avatar's position
 *
 * @param {object} props
 * @param {TransitionPasswordAvatarPosition} props.passwordAvatarPosition - The password form's avatar position
 * @param {boolean} props.requestTransitionStart - Boolean that define if the transition should start
 * @param {Function} props.setTransitionEnded - Function to call when the transition ends
 * @returns {import('react').ComponentClass}
 */
export const TransitionToPasswordView = ({
  passwordAvatarPosition,
  requestTransitionStart,
  setTransitionEnded
}) => {
  const colors = getColors()

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
            backgroundColor: colors.primaryColor
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
            ]
          }
        ]}
      >
        <View style={[styles.avatarContainer]}>
          <CozyIcon color={colors.paperBackgroundColor} />
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
