import React from 'react'
import { SafeAreaView, View, ViewProps } from 'react-native'

import { useDimensions } from '/libs/dimensions'
import { styles } from '/ui/Container/styles'
import { useCozyTheme } from '/ui/CozyTheme/CozyTheme'

type ContainerProps = ViewProps

export const Container = ({
  children,
  style,
  ...props
}: ContainerProps): JSX.Element => {
  const dimensions = useDimensions()
  const { colors } = useCozyTheme()

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: dimensions.navbarHeight + 16,
          backgroundColor: colors.paperBackgroundColor
        },
        style
      ]}
      {...props}
    >
      <SafeAreaView>{children}</SafeAreaView>
    </View>
  )
}
