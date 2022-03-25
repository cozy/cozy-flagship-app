import React, {useEffect, useRef, useState} from 'react'
import {Animated} from 'react-native'
import {SvgXml} from 'react-native-svg'

import {screenHeight, screenWidth} from '../../libs/dimensions'
import {
  getPersistentIconTable,
  iconFallback,
} from '../../libs/functions/iconTable'
import {styles} from './CozyAppScreen.styles'

const config = {
  duration: 300,
  width: '64%',
  height: '64%',
  driver: true,
}

const getTranslateInput = params => ({
  x:
    params.x - styles.fadingContainer.left - (screenWidth - params.width) * 0.5,
  y:
    params.y -
    styles.fadingContainer.top -
    (screenHeight - params.height) * 0.5,
})

const getScaleInput = params => ({
  x: params.width / screenWidth,
  y: params.height / screenHeight,
})

export const Animation = ({onFinished, params, slug}) => {
  const [iconTable, setIconTable] = useState()
  const animateOpacity = useRef(new Animated.Value(1)).current
  const animateTranslate = useRef(
    new Animated.ValueXY(getTranslateInput(params)),
  ).current
  const animateScale = useRef(
    new Animated.ValueXY(getScaleInput(params)),
  ).current
  const animateFadeOut = useRef(new Animated.Value(1)).current
  class SVG extends React.Component {
    render() {
      return (
        <SvgXml
          xml={iconTable[slug] || iconFallback}
          width={config.width}
          height={config.height}
        />
      )
    }
  }
  const Icon = Animated.createAnimatedComponent(SVG)

  useEffect(() => {
    const asyncCore = async () => {
      setIconTable(await getPersistentIconTable())
    }

    !iconTable && asyncCore()
  }, [iconTable])

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animateTranslate, {
        toValue: {x: 0, y: 0},
        duration: config.duration,
        useNativeDriver: config.driver,
      }),
      Animated.timing(animateScale, {
        toValue: {x: 1, y: 1},
        duration: config.duration,
        useNativeDriver: config.driver,
      }),
      Animated.timing(animateOpacity, {
        toValue: 0,
        duration: config.duration,
        useNativeDriver: config.driver,
      }),
    ]).start(({finished}) => {
      onFinished(finished)

      Animated.timing(animateFadeOut, {
        toValue: 0,
        duration: config.duration,
        useNativeDriver: config.driver,
      }).start()
    })
  }, [
    animateFadeOut,
    animateOpacity,
    animateScale,
    animateTranslate,
    onFinished,
  ])

  return iconTable ? (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.fadingContainer,
        {opacity: animateFadeOut},
        {
          transform: [
            {translateX: animateTranslate.x},
            {translateY: animateTranslate.y},
            {scaleX: animateScale.x},
            {scaleY: animateScale.y},
          ],
        },
      ]}>
      <Icon style={{opacity: animateOpacity}} />
    </Animated.View>
  ) : null
}
