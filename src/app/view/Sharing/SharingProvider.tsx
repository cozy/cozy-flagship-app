import { useNavigation, useNavigationState } from '@react-navigation/native'
import React, { useReducer, useEffect, useCallback } from 'react'

import { useClient, useQuery } from 'cozy-client'

import { SharingCozyApp } from '/app/domain/sharing/models/SharingCozyApp'
import { handleReceivedFiles } from '/app/domain/sharing/services/SharingData'
import { handleSharing } from '/app/domain/sharing/services/SharingStatus'
import { useError } from '/app/view/Error/ErrorProvider'
import { useI18n } from '/locales/i18n'
import {
  SharingIntentStatus,
  SharingActionType
} from '/app/domain/sharing/models/SharingState'
import {
  fetchSharingCozyApps,
  getRouteToUpload
} from '/app/domain/sharing/services/SharingNetwork'
import {
  initialState,
  SharingDispatchContext,
  sharingReducer,
  SharingStateContext
} from '/app/view/Sharing/SharingState'
import { routes } from '/constants/routes'

export const SharingProvider = ({
  children
}: React.PropsWithChildren): JSX.Element => {
  const client = useClient()
  const [state, dispatch] = useReducer(sharingReducer, initialState)
  const { t } = useI18n()
  const { handleError } = useError()
  const navigationState = useNavigationState(state => state)
  const navigation = useNavigation()
  const { data } = useQuery(
    fetchSharingCozyApps.definition,
    fetchSharingCozyApps.options
  ) as { data?: SharingCozyApp[] | [] }

  const isProcessed = useCallback(
    (): boolean => state.filesToUpload.length > 1 || state.errored,
    [state.filesToUpload, state.errored]
  )
  const hasData = useCallback(
    (): boolean =>
      Boolean(
        state.filesToUpload.length > 0 && client && data && data.length > 0
      ),
    [client, data, state.filesToUpload]
  )

  // This effect is triggered at mount and unmount of the provider,
  // its role is to listen native events and update the state accordingly
  useEffect(() => {
    // As soon as we can detect that the app was opened with or without files,
    // we can update the state accordingly so the view can react to it
    const cleanupSharingIntent = handleSharing(
      (status: SharingIntentStatus) => {
        dispatch({ type: SharingActionType.SetIntentStatus, payload: status })
      }
    )

    // Pass a callback to the low level function that handles the received files
    // We will have access to their paths in the provider state afterwards
    const cleanupReceivedFiles = handleReceivedFiles(files => {
      dispatch({ type: SharingActionType.SetFilesToUpload, payload: files })
    })

    return () => {
      cleanupReceivedFiles()
      cleanupSharingIntent()
    }
  }, [])

  // Fetches the route of the cozy-app that will handle the sharing intent
  useEffect(() => {
    if (isProcessed() || !hasData()) return
    const { result, error } = getRouteToUpload(data, client)

    if (error) {
      dispatch({ type: SharingActionType.SetFlowErrored, payload: true })
    } else if (result !== undefined) {
      dispatch({ type: SharingActionType.SetRouteToUpload, payload: result })
    }
  }, [client, data, handleError, hasData, isProcessed])

  // If an error is detected, we handle that by abandoning the flow.
  // The user will be redirected to the home screen and the sharing mode is ended until next file sharing.
  useEffect(() => {
    if (state.errored) {
      dispatch({ type: SharingActionType.SetRecoveryState })
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
    state.errored,
    t
  ])

  return (
    <SharingStateContext.Provider value={state}>
      <SharingDispatchContext.Provider value={dispatch}>
        {children}
      </SharingDispatchContext.Provider>
    </SharingStateContext.Provider>
  )
}
