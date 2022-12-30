import React, { useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import { SvgXml } from 'react-native-svg'

import ProgressBar from '/components/Bar'
import { iconTable, iconFallback } from '/libs/functions/iconTable'
import { getDimensions } from '/libs/dimensions'
import { palette } from '/ui/palette'
import { styles } from './CozyAppScreen.styles'

const { screenHeight, screenWidth } = getDimensions()

const config = {
  duration: 300,
  width: '44%',
  height: '44%',
  driver: true
}

const progressBarConfig = {
  width: null,
  indeterminate: true,
  unfilledColor: palette.Grey[200],
  color: palette.Primary[600],
  borderWidth: 0,
  height: 8,
  borderRadius: 100,
  indeterminateAnimationDuration: 1500
}

const progressBarAnimConfig = {
  fadeIn: {
    toValue: 1,
    duration: 50,
    useNativeDriver: config.driver
  },
  fadeOut: {
    toValue: 0,
    duration: 50,
    useNativeDriver: config.driver
  }
}

const containerAnimConfig = {
  fadeOut: {
    toValue: 0,
    duration: 300,
    useNativeDriver: config.driver
  }
}

const getTranslateInput = params => ({
  x:
    params.x - styles.fadingContainer.left - (screenWidth - params.width) * 0.5,
  y:
    params.y - styles.fadingContainer.top - (screenHeight - params.height) * 0.5
})

const getScaleInput = params => ({
  x: params.width / screenWidth,
  y: params.height / screenHeight
})

export const Animation = ({
  onFirstHalf,
  onFinished,
  shouldExit,
  params,
  slug
}) => {
  const animateTranslate = useRef(
    new Animated.ValueXY(getTranslateInput(params))
  ).current
  const animateScale = useRef(
    new Animated.ValueXY(getScaleInput(params))
  ).current
  const animateFadeOut = useRef(new Animated.Value(1)).current
  const animateBarOpacity = useRef(new Animated.Value(0)).current

  class SVG extends React.Component {
    render() {
      return (
        <SvgXml
          xml={iconTable[slug]?.xml || iconFallback}
          width={config.width}
          height={config.height}
        />
      )
    }
  }

  const Icon = Animated.createAnimatedComponent(SVG)

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animateTranslate, {
        toValue: { x: 0, y: 0 },
        duration: config.duration,
        useNativeDriver: config.driver
      }),
      Animated.timing(animateScale, {
        toValue: { x: 1, y: 1 },
        duration: config.duration,
        useNativeDriver: config.driver
      })
    ]).start(() => {
      onFirstHalf(true)

      Animated.timing(animateBarOpacity, progressBarAnimConfig.fadeIn).start()
    })
  }, [animateBarOpacity, animateScale, animateTranslate, onFirstHalf])

  useEffect(() => {
    shouldExit &&
      Animated.parallel([
        Animated.timing(animateFadeOut, containerAnimConfig.fadeOut),
        Animated.timing(animateBarOpacity, progressBarAnimConfig.fadeOut)
      ]).start(() => {
        onFinished(true)
      })
  }, [animateBarOpacity, animateFadeOut, onFinished, shouldExit])

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.fadingContainer,
        { opacity: animateFadeOut },
        {
          transform: [
            { translateX: animateTranslate.x },
            { translateY: animateTranslate.y },
            { scaleX: animateScale.x },
            { scaleY: animateScale.y }
          ]
        }
      ]}
    >
      <Icon />

      <Animated.View
        style={[styles.progressBarContainer, { opacity: animateBarOpacity }]}
      >
        <ProgressBar {...progressBarConfig} />
      </Animated.View>
    </Animated.View>
  )
}
