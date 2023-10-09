import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect } from 'react'
import { View } from 'react-native'

import { Typography } from '/ui/Typography'
import {
  useFilesToUpload,
  useOsReceiveDispatch,
  useOsReceiveState
} from '/app/view/OsReceive/OsReceiveState'
import { RootStackParamList } from '/constants/route-types'
import { useDefaultIconParams } from '/libs/functions/openApp'
import { navigate } from '/libs/RootNavigation'
import { routes } from '/constants/routes'
import {
  OsReceiveActionType,
  OsReceiveFileStatus
} from '/app/domain/osReceive/models/OsReceiveState'

export const OsReceiveScreen = (): JSX.Element | null => {
  const osReceiveState = useOsReceiveState()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const iconParams = useDefaultIconParams()
  const filesToUpload = useFilesToUpload()
  const osReceiveDispatch = useOsReceiveDispatch()

  useEffect(() => {
    const { href, slug } = osReceiveState.routeToUpload
    const shouldNavigate = href && slug && filesToUpload.length > 0

    if (shouldNavigate) {
      navigate(routes.cozyapp, {
        href,
        slug,
        iconParams
      })
      osReceiveDispatch({
        type: OsReceiveActionType.UpdateFileStatus,
        payload: { name: '*', status: OsReceiveFileStatus.queued }
      })
    }
  }, [iconParams, navigation, osReceiveState, filesToUpload, osReceiveDispatch])

  return filesToUpload.length > 0 ? (
    <View
      style={{
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Typography>...loading</Typography>
    </View>
  ) : null
}
