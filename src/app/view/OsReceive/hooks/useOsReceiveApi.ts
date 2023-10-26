import { useEffect } from 'react'

import { useNativeIntent } from 'cozy-intent'

import {
  useOsReceiveDispatch,
  useOsReceiveState
} from '/app/view/OsReceive/state/OsReceiveState'
import { OsReceiveLogger } from '/app/domain/osReceive'
import {
  findMostRecentlyHandledFile,
  sendMessageForFile
} from '/app/domain/osReceive/services/OsReceiveApi'

export const useOsReceiveApi = (): void => {
  const state = useOsReceiveState()
  const nativeIntent = useNativeIntent()
  const dispatch = useOsReceiveDispatch()

  useEffect(() => {
    if (!nativeIntent) {
      OsReceiveLogger.error('Native intent not available')
      return
    }

    const mostRecentlyHandledFile = findMostRecentlyHandledFile(
      state.filesToUpload
    )

    if (mostRecentlyHandledFile?.handledTimestamp) {
      void sendMessageForFile(
        mostRecentlyHandledFile,
        state.routeToUpload,
        nativeIntent,
        dispatch
      )
    }
  }, [dispatch, nativeIntent, state])
}
