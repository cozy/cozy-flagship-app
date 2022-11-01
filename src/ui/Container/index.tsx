import React from 'react'
import { SafeAreaView, View, ViewProps } from 'react-native'
import { getNavbarHeight } from '/libs/dimensions'

import { styles } from '/ui/Container/styles'

type ContainerProps = ViewProps

export const Container = ({
  children,
  style,
  ...props
}: ContainerProps): JSX.Element => (
  <View
    style={[styles.container, { paddingBottom: getNavbarHeight() + 16 }, style]}
    {...props}
  >
    <SafeAreaView>{children}</SafeAreaView>
  </View>
)
