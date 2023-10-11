import { useNavigation, useNavigationState } from '@react-navigation/native'
import React, { useReducer, useEffect, useState, useRef } from 'react'

import { useClient } from 'cozy-client'

import { handleReceivedFiles } from '/app/domain/osReceive/services/OsReceiveData'
import { useError } from '/app/view/Error/ErrorProvider'
import { useI18n } from '/locales/i18n'
import {
  OsReceiveActionType,
  OsReceiveFileStatus
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
import { AcceptFromFlagshipManifest } from '/app/domain/osReceive/models/OsReceiveCozyApp'
import { backToHome } from '/libs/intents/localMethods'
import { OsReceiveLogger } from '/app/domain/osReceive'

export const OsReceiveProvider = ({
  children
}: React.PropsWithChildren): JSX.Element => {
  const client = useClient()
  const [state, dispatch] = useReducer(osReceiveReducer, initialState)
  const { t } = useI18n()
  const { handleError } = useError()
  const navigationState = useNavigationState(state => state)
  const navigation = useNavigation()
  const [data, setQuery] = useState<AcceptFromFlagshipManifest[]>([])
  const didCall = useRef(false)

  // This effect is triggered at mount and unmount of the provider,
  // its role is to listen native events and update the state accordingly
  useEffect(() => {
    // Pass a callback to the low level function that handles the received files
    // We will have access to their paths in the provider state afterwards
    const cleanupReceivedFiles = handleReceivedFiles(files => {
      dispatch({ type: OsReceiveActionType.SetFilesToUpload, payload: files })
      backToHome().catch(err => {
        OsReceiveLogger.warn(
          'Error while going back to home after receiving files from native',
          err
        )
      })
    })

    return () => {
      cleanupReceivedFiles()
    }
  }, [])

  useEffect(() => {
    if (!client || didCall.current) return

    const fetchRegistry = async (): Promise<void> => {
      const res = (await client.fetchQueryAndGetFromState({
        definition: fetchOsReceiveCozyApps.definition,
        options: fetchOsReceiveCozyApps.options
      })) as { data: AcceptFromFlagshipManifest[] }

      if (res.data.length > 0) {
        didCall.current = true
        dispatch({
          type: OsReceiveActionType.SetCandidateApps,
          payload: res.data
        })
        setQuery(res.data)
      }
    }

    void fetchRegistry()
  }),
    [client]

  // Fetches the route of the cozy-app that will handle the osReceive intent
  useEffect(() => {
    if (state.filesToUpload.length === 0 || state.routeToUpload.href) return
    const { result, error } = getRouteToUpload(data, client)

    if (error) {
      dispatch({ type: OsReceiveActionType.SetFlowErrored, payload: true })
    } else if (result !== undefined) {
      dispatch({ type: OsReceiveActionType.SetRouteToUpload, payload: result })
    }
  }, [client, data, handleError, state])

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

  // If every file is either uploaded or failed to upload, the flow is ended
  useEffect(() => {
    if (state.filesToUpload.length === 0) return

    if (
      state.filesToUpload.every(
        file =>
          file.status === OsReceiveFileStatus.uploaded ||
          file.status === OsReceiveFileStatus.error
      )
    ) {
      dispatch({ type: OsReceiveActionType.SetInitialState })
    }
  }, [state.filesToUpload])

  return (
    <OsReceiveStateContext.Provider value={state}>
      <OsReceiveDispatchContext.Provider value={dispatch}>
        {children}
      </OsReceiveDispatchContext.Provider>
    </OsReceiveStateContext.Provider>
  )
}