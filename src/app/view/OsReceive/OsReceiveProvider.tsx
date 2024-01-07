import { useNavigation, useNavigationState } from '@react-navigation/native'
import React, { useReducer, useEffect, useRef } from 'react'

import { useClient } from 'cozy-client'

import { OsReceiveEmitter } from '/app/domain/osReceive/services/OsReceiveData'
import { useError } from '/app/view/Error/ErrorProvider'
import { useI18n } from '/locales/i18n'
import {
  OsReceiveActionType,
  OsReceiveFile,
  OsReceiveFileStatus
} from '/app/domain/osReceive/models/OsReceiveState'
import { fetchOsReceiveCozyApps } from '/app/domain/osReceive/models/OsReceiveCozyApp'
import {
  initialState,
  OsReceiveDispatchContext,
  osReceiveReducer,
  OsReceiveStateContext
} from '/app/view/OsReceive/state/OsReceiveState'
import { routes } from '/constants/routes'
import { AcceptFromFlagshipManifest } from '/app/domain/osReceive/models/OsReceiveCozyApp'
import { backToHome } from '/libs/intents/localMethods'
import { OsReceiveLogger } from '/app/domain/osReceive'
import { LoadingOverlay } from '/ui/LoadingOverlay'

export const OsReceiveProvider = ({
  children
}: React.PropsWithChildren): JSX.Element => {
  const client = useClient()
  const [state, dispatch] = useReducer(osReceiveReducer, initialState)
  const { t } = useI18n()
  const { handleError } = useError()
  const navigationState = useNavigationState(state => state)
  const navigation = useNavigation()
  const didCall = useRef(false)

  useEffect(() => {
    const onFilesReceived = (files: OsReceiveFile[]): void => {
      if (!client?.isLogged) return
      dispatch({ type: OsReceiveActionType.SetFilesToUpload, payload: files })
      OsReceiveEmitter.clearReceivedFiles()
      backToHome().catch(error => {
        OsReceiveLogger.error('Could not go back to home', error)
      })
    }

    const onError = (error: unknown): void => {
      OsReceiveLogger.error('Could not get received files', error)
      dispatch({ type: OsReceiveActionType.SetFlowErrored, payload: true })
    }

    OsReceiveEmitter.ensureActivation()

    OsReceiveEmitter.on('filesReceived', onFilesReceived)
    OsReceiveEmitter.on('error', onError)

    return () => {
      OsReceiveEmitter.off('filesReceived', onFilesReceived)
      OsReceiveEmitter.off('error', onError)
      OsReceiveEmitter.clearReceivedFiles()
    }
  }, [client?.isLogged])

  useEffect(() => {
    if (!client || didCall.current || state.filesToUpload.length === 0) return

    const fetchAppsAndSetCandidates = async (): Promise<void> => {
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
      }
    }

    void fetchAppsAndSetCandidates()
  }),
    [client, state.filesToUpload.length]

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

        {state.filesToShare.length > 0 && (
          <LoadingOverlay
            loadingMessage={t('services.osReceive.shareFiles.downloadingFiles')}
          />
        )}
      </OsReceiveDispatchContext.Provider>
    </OsReceiveStateContext.Provider>
  )
}
