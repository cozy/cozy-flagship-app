import React, { useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import { SvgXml } from 'react-native-svg'

import { screenHeight, screenWidth } from '../../libs/dimensions'
import { iconTable, iconFallback } from '../../libs/functions/iconTable'
import { styles } from './CozyAppScreen.styles'

const config = {
  duration: 300,
  width: '44%',
  height: '44%',
  driver: true
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

export const Animation = ({ onFirstHalf, onFinished, params, slug }) => {
  const animateTranslate = useRef(
    new Animated.ValueXY(getTranslateInput(params))
  ).current
  const animateScale = useRef(
    new Animated.ValueXY(getScaleInput(params))
  ).current
  const animateFadeOut = useRef(new Animated.Value(1)).current
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

      Animated.timing(animateFadeOut, {
        toValue: 0,
        duration: config.duration,
        useNativeDriver: config.driver
      }).start(() => {
        onFinished(true)
      })
    })
  }, [animateFadeOut, animateScale, animateTranslate, onFinished, onFirstHalf])

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
    </Animated.View>
  )
}
