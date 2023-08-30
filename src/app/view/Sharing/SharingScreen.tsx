import { Container } from '/ui/Container'
import { Grid } from '/ui/Grid'
import { Typography } from '/ui/Typography'
import { useSharingState } from '/app/view/Sharing/SharingState'

import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'

import { getDefaultIconParams } from '/libs/functions/openApp'
import { RootStackParamList, Routes } from '/constants/route-types'

import React, { useEffect } from 'react'

export const SharingScreen = (): JSX.Element => {
  const sharingState = useSharingState()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

  // Open the cozy-app that will handle the sharing intent
  useEffect(() => {
    if (
      sharingState.routeToUpload.href === undefined ||
      sharingState.routeToUpload.slug === undefined
    )
      return

    navigation.goBack()
    navigation.navigate(Routes.cozyapp, {
      href: sharingState.routeToUpload.href,
      slug: sharingState.routeToUpload.slug,
      iconParams: getDefaultIconParams()
    })
  }, [
    navigation,
    sharingState.routeToUpload.href,
    sharingState.routeToUpload.slug
  ])

  return (
    <Container>
      <Grid>
        <Typography>...loading</Typography>
      </Grid>
    </Container>
  )
}