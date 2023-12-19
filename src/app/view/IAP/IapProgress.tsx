import React, { useEffect, useRef } from 'react'
import { Animated, Easing, StyleSheet, Text, View } from 'react-native'

import { FlagshipUI } from 'cozy-intent'

import { ScreenIndexes, useFlagshipUI } from '/app/view/FlagshipUI'
import { useI18n } from '/locales/i18n'
import { getColors } from '/ui/colors'
import { Icon } from '/ui/Icon'
import { Spinner } from '/ui/Icons/Spinner'

const colors = getColors()

const defaultFlagshipUI: FlagshipUI = {
  bottomTheme: 'light',
  topTheme: 'light'
}

export const IapProgress = (): JSX.Element => {
  const { t } = useI18n()

  useFlagshipUI(
    'ClouderyOfferLoading',
    ScreenIndexes.CLOUDERY_OFFER + 1,
    defaultFlagshipUI
  )

  const animateRotate = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.timing(animateRotate, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start()
  }, [animateRotate])

  const spin = animateRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  })

  return (
    <View style={styles.progressContainer}>
      <Animated.View
        style={{
          transform: [{ rotate: spin }]
        }}
      >
        <Icon icon={Spinner} style={styles.spinner} />
      </Animated.View>
      <Text style={styles.headerTextStyle}>
        {t('screens.clouderyOffer.iapProgress')}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: colors.primaryColor
  },
  headerTextStyle: {
    fontSize: 13,
    fontFamily: 'Lato-Bold',
    color: colors.paperBackgroundColor,
    textAlign: 'center',
    marginTop: 16
  },
  spinner: {
    width: 70,
    height: 70,
    fill: colors.paperBackgroundColor
  }
})
