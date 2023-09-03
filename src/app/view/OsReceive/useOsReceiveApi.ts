import { useEffect } from 'react'

import { useNativeIntent } from 'cozy-intent'

import {
  useOsReceiveDispatch,
  useOsReceiveState
} from '/app/view/OsReceive/OsReceiveState'
import { OsReceiveLogger } from '/app/domain/osReceive'
import { OsReceiveActionType } from '/app/domain/osReceive/models/OsReceiveState'

export const useOsReceiveApi = (): void => {
  const state = useOsReceiveState()
  const nativeIntent = useNativeIntent()
  const dispatch = useOsReceiveDispatch()

  useEffect(() => {
    if (!nativeIntent) return
    const isLast = state.filesToUpload.length === 0

    const onUploaded = async (): Promise<void> => {
      if (!state.routeToUpload.href) return

      const success = state.fileUploaded
      const failure = state.fileFailed

      try {
        await nativeIntent.call(
          state.routeToUpload.href,
          'onFileUploaded',
          success ?? failure,
          Boolean(success),
          isLast
        )
      } catch (error) {
        OsReceiveLogger.error('onUploaded error', error)

        dispatch({
          type: OsReceiveActionType.SetFlowErrored,
          payload: true
        })
      }
    }

    void onUploaded()
  }, [dispatch, nativeIntent, state])
}
