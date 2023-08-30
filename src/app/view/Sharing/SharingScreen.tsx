import { Container } from '/ui/Container'
import { Grid } from '/ui/Grid'
import { Typography } from '/ui/Typography'
import { useOsReceiveState } from '/app/view/Sharing/SharingState'

import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'

import { getDefaultIconParams } from '/libs/functions/openApp'
import { RootStackParamList, Routes } from '/constants/route-types'

import React, { useEffect } from 'react'

export const OsReceiveScreen = (): JSX.Element => {
  const osReceiveState = useOsReceiveState()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

  // Open the cozy-app that will handle the OsReceive intent
  useEffect(() => {
    if (
      osReceiveState.routeToUpload.href === undefined ||
      osReceiveState.routeToUpload.slug === undefined
    )
      return

    navigation.goBack()
    navigation.navigate(Routes.cozyapp, {
      href: osReceiveState.routeToUpload.href,
      slug: osReceiveState.routeToUpload.slug,
      iconParams: getDefaultIconParams()
    })
  }, [
    navigation,
    osReceiveState.routeToUpload.href,
    osReceiveState.routeToUpload.slug
  ])

  return (
    <Container>
      <Grid>
        <Typography>...loading</Typography>
      </Grid>
    </Container>
  )
}
