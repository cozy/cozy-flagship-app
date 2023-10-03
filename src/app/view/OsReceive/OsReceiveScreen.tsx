import { useNavigation, useNavigationState } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useCallback, useEffect } from 'react'
import { View } from 'react-native'

import { Typography } from '/ui/Typography'
import { useOsReceiveState } from '/app/view/OsReceive/OsReceiveState'
import { RootStackParamList, Routes } from '/constants/route-types'
import { routes } from '/constants/routes'
import { useDefaultIconParams } from '/libs/functions/openApp'

export const OsReceiveScreen = (): JSX.Element | null => {
  const osReceiveState = useOsReceiveState()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const navigationState = useNavigationState(state => state)
  const iconParams = useDefaultIconParams()

  const navCallback = useCallback(
    (href: string, slug: string) => {
      navigation.navigate(Routes.cozyapp, {
        href,
        slug,
        iconParams
      })
    },
    [iconParams, navigation]
  )

  useEffect(() => {
    const { href, slug } = osReceiveState.routeToUpload

    if (href && slug) {
      window.setTimeout(() => navCallback(href, slug), 1500)
    }
  }, [navCallback, osReceiveState.routeToUpload])

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (navigationState?.routes[navigationState.index].name === routes.cozyapp)
    return null

  if (osReceiveState.filesToUpload.length === 0) return null

  return (
    <View
      style={{
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Typography>...loading</Typography>
    </View>
  )
}
