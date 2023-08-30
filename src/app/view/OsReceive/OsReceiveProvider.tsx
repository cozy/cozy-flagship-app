import { useNavigation, useNavigationState } from '@react-navigation/native'
import React, { useReducer, useEffect } from 'react'

import { useClient, useQuery } from 'cozy-client'

import { OsReceiveCozyApp } from '/app/domain/osReceive/models/OsReceiveCozyApp'
import { handleReceivedFiles } from '/app/domain/osReceive/services/OsReceiveData'
import { handleOsReceive } from '/app/domain/osReceive/services/OsReceiveStatus'
import { useError } from '/app/view/Error/ErrorProvider'
import { useI18n } from '/locales/i18n'
import {
  OsReceiveIntentStatus,
  OsReceiveActionType
} from '/app/domain/osReceive/models/OsReceiveState'
import {
  fetchOsReceiveCozyApps,
  getRouteToUpload
} from '/app/domain/osReceive/services/OsReceiveNetwork'
import {
  initialState,
  OsReceiveDispatchContext,
  osReceiveReducer,
  OsReceiveStateContext
} from '/app/view/OsReceive/OsReceiveState'
import { routes } from '/constants/routes'

import { QueryFetchStatus } from 'cozy-client/types/types'

export const OsReceiveProvider = ({
  children
}: React.PropsWithChildren): JSX.Element => {
  const client = useClient()
  const [state, dispatch] = useReducer(osReceiveReducer, initialState)
  const { t } = useI18n()
  const { handleError } = useError()
  const navigationState = useNavigationState(state => state)
  const navigation = useNavigation()
  const { data, fetchStatus } = useQuery(
    fetchOsReceiveCozyApps.definition,
    fetchOsReceiveCozyApps.options
  ) as { data?: OsReceiveCozyApp[] | []; fetchStatus?: QueryFetchStatus }

  // This effect is triggered at mount and unmount of the provider,
  // its role is to listen native events and update the state accordingly
  useEffect(() => {
    // As soon as we can detect that the app was opened with or without files,
    // we can update the state accordingly so the view can react to it
    const cleanupOsReceiveIntent = handleOsReceive(
      (status: OsReceiveIntentStatus) => {
        dispatch({ type: OsReceiveActionType.SetIntentStatus, payload: status })
      }
    )

    // Pass a callback to the low level function that handles the received files
    // We will have access to their paths in the provider state afterwards
    const cleanupReceivedFiles = handleReceivedFiles(files => {
      dispatch({ type: OsReceiveActionType.SetFilesToUpload, payload: files })
    })

    return () => {
      cleanupReceivedFiles()
      cleanupOsReceiveIntent()
    }
  }, [])

  // Fetches the route of the cozy-app that will handle the osReceive intent
  useEffect(() => {
    if (state.filesToUpload.length === 0 || state.routeToUpload.href) return
    const { result, error } = getRouteToUpload(data, client)

    if (error) {
      dispatch({ type: OsReceiveActionType.SetFlowErrored, payload: true })
    } else if (result !== undefined) {
      dispatch({ type: OsReceiveActionType.SetRouteToUpload, payload: result })
    }
  }, [client, data, handleError, state, fetchStatus])

  // If an error is detected, we handle that by abandoning the flow.
  // The user will be redirected to the home screen and the osReceive mode is ended until next file osReceive.
  useEffect(() => {
    if (state.errored) {
      dispatch({ type: OsReceiveActionType.SetRecoveryState })
      if (navigationState.routes[navigationState.index].name !== routes.lock) {
        handleError(t('errors.unknown_error'), () => {
          navigation.navigate(routes.home as never)
        })
      }
    }
  }, [
    handleError,
    navigation,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    navigationState?.index,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    navigationState?.routes,
    state,
    t
  ])

  return (
    <OsReceiveStateContext.Provider value={state}>
      <OsReceiveDispatchContext.Provider value={dispatch}>
        {children}
      </OsReceiveDispatchContext.Provider>
    </OsReceiveStateContext.Provider>
  )
}
