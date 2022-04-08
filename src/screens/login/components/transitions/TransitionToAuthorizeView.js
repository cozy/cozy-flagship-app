import React, {useCallback, useEffect, useRef, useState} from 'react'
import {Animated, Dimensions, Easing, StyleSheet, View} from 'react-native'
import {CozyIcon} from './transitions-icons/CozyIcon'

import {getColors} from '../../../../theme/colors'

/**
 * Display a transition that should come before displaying the Authorize view
 *
 * @param {object} props
 * @param {Function} props.setTransitionEnded - Function to call when the transition ends
 * @returns {import('react').ComponentClass}
 */
export const TransitionToAuthorizeView = ({setTransitionEnded}) => {
  const colors = getColors()

  const animationDelayInSecond = 400
  const animationDurationInSecond = 200

  // we suppose the diplayed Cozy logo is a square
  const initialSize = 200
  const targetSize = 1600

  const targetTop = Dimensions.get('window').height / 2 - targetSize / 2
  const targetLeft = Dimensions.get('window').width / 2 - targetSize / 2

  const targetScale = initialSize / targetSize

  const animatedScale = useRef(new Animated.Value(targetScale)).current
  const animatedOpactity = useRef(new Animated.Value(0)).current

  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!started) {
      doTransition().then(() => {
        setTransitionEnded()
      })
    }
  }, [doTransition, started, setTransitionEnded])

  const doTransition = useCallback(() => {
    return new Promise((resolve, reject) => {
      setStarted(true)

      animatedScale.setValue(targetScale)
      animatedOpactity.setValue(0)

      const opacityAnimation = Animated.timing(animatedOpactity, {
        toValue: 1,
        duration: animationDurationInSecond,
        easing: Easing.ease,
        useNativeDriver: true,
      })
      const scaleAnimation = Animated.timing(animatedScale, {
        toValue: 1,
        duration: animationDurationInSecond,
        easing: Easing.ease,
        useNativeDriver: true,
      })

      const sequence = [
        Animated.delay(animationDelayInSecond),
        Animated.parallel([opacityAnimation, scaleAnimation]),
      ]

      Animated.sequence(sequence).start(({finished}) => {
        if (finished) {
          resolve()
        }
      })
    })
  }, [animatedOpactity, animatedScale, targetScale])

  return (
    <Animated.View
      style={[
        styles.background,
        {
          backgroundColor: colors.primaryColor,
        },
      ]}>
      <Animated.View
        style={[
          styles.cozyLogo,
          {
            top: targetTop,
            left: targetLeft,
            height: targetSize,
            width: targetSize,
            transform: [{scaleX: animatedScale}, {scaleY: animatedScale}],
          },
        ]}>
        <View style={[styles.avatarContainer]}>
          <CozyIcon color={colors.paperBackgroundColor} />
        </View>
      </Animated.View>
      <Animated.View
        style={[
          styles.foreground,
          {
            opacity: animatedOpactity,
            backgroundColor: colors.paperBackgroundColor,
          },
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
    bottom: 0,
  },
  foreground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cozyLogo: {
    position: 'absolute',
  },
})
