import Minilog from 'cozy-minilog'

import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { SvgXml } from 'react-native-svg'

import { getErrorMessage } from '/libs/functions/getErrorMessage'
import { getLogoSvg } from '/ui/Logo/logo'
import { isLightBackground } from '/screens/login/components/functions/clouderyBackgroundFetcher'
import { getColors } from '/ui/colors'

const log = Minilog('CozyLogoScreen')

const colors = getColors()

interface CozyLogoScreenProps {
  backgroundColor: string
}

export const CozyLogoScreen = ({
  backgroundColor
}: CozyLogoScreenProps): JSX.Element => {
  const [foregroundColor, setForegroundColor] = useState(
    colors.paperBackgroundColor
  )

  useEffect(() => {
    try {
      const shouldUsePrimaryColor = isLightBackground(backgroundColor)

      const color = shouldUsePrimaryColor
        ? colors.primaryColor
        : colors.paperBackgroundColor

      setForegroundColor(color)
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      log.error(
        `Something went wrong while trying to check if isLightBackground: ${errorMessage}`
      )
    }
  }, [backgroundColor])

  return (
    <View
      style={[
        styles.view,
        {
          backgroundColor: backgroundColor
        }
      ]}
    >
      <CozyLogo
        foregroundColor={foregroundColor}
        backgroundColor={backgroundColor}
      />
    </View>
  )
}

interface CozyLogoProps {
  backgroundColor: string
  foregroundColor: string
}

const CozyLogo = ({
  backgroundColor,
  foregroundColor
}: CozyLogoProps): JSX.Element => (
  <SvgXml xml={getLogoSvg({ backgroundColor, foregroundColor })} />
)

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
