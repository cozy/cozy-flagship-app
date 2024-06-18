import React, { useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import { SvgXml } from 'react-native-svg'

import { ScreenIndexes, useFlagshipUI } from '/app/view/FlagshipUI'
import ProgressBar from '/components/Bar'
import { iconTable, iconFallback } from '/libs/functions/iconTable'
import { getColorScheme } from '/app/theme/colorScheme'
import { getColors } from '/ui/colors'

import {
  config,
  containerAnimConfig,
  getScaleInput,
  getTranslateInput,
  progressBarAnimConfig,
  progressBarConfig
} from './CozyAppScreen.functions'
import { styles } from './CozyAppScreen.styles'
import { CozyAppScreenAnimationProps } from './CozyAppScreen.types'

export const Animation = ({
  onFirstHalf,
  onFinished,
  shouldExit,
  params,
  slug
}: CozyAppScreenAnimationProps): JSX.Element => {
  const animateTranslate = useRef(
    new Animated.ValueXY(getTranslateInput(params))
  ).current
  const animateScale = useRef(
    new Animated.ValueXY(getScaleInput(params))
  ).current
  const animateFadeOut = useRef(new Animated.Value(1)).current
  const animateBarOpacity = useRef(new Animated.Value(0)).current
  const colors = getColors({ useUserColorScheme: true })

  const { setFlagshipColors } = useFlagshipUI(
    'CozyAppScreenAnimation',
    ScreenIndexes.COZY_APP_VIEW + 1
  )

  class SVG extends React.Component {
    render(): JSX.Element {
      return (
        <SvgXml
          xml={iconTable[slug]?.xml ?? iconFallback}
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
      setFlagshipColors({
        topTheme:
          getColorScheme({ useUserColorScheme: true }) === 'dark'
            ? 'light'
            : 'dark',
        bottomTheme:
          getColorScheme({ useUserColorScheme: true }) === 'dark'
            ? 'light'
            : 'dark'
      })

      Animated.timing(animateBarOpacity, progressBarAnimConfig.fadeIn).start()
    })
  }, [
    animateBarOpacity,
    animateScale,
    animateTranslate,
    onFirstHalf,
    setFlagshipColors
  ])

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
        {
          backgroundColor: colors.paperBackgroundColor
        },
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
