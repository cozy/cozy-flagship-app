import { useEffect } from 'react'

import { useNativeIntent } from 'cozy-intent'

import { useOsReceiveState } from '/app/view/OsReceive/OsReceiveState'
import { OsReceiveLogger } from '/app/domain/osReceive'

export const useOsReceiveApi = (): void => {
  const state = useOsReceiveState()
  const nativeIntent = useNativeIntent()

  useEffect(() => {
    if (state.filesUploaded.length === 0 || !nativeIntent) return
    const isLast = state.filesUploaded.length === state.filesToUpload.length

    const onUploaded = async (): Promise<void> => {
      OsReceiveLogger.info('onUploaded called')

      try {
        const res = await nativeIntent.call(
          'drive.dev.192-168-1-65.nip.io',
          'onFileUploaded',
          state.filesUploaded[state.filesUploaded.length - 1],
          isLast ? state.filesUploaded.length : undefined
        )
        OsReceiveLogger.info('onUploaded res', res)
      } catch (error) {
        OsReceiveLogger.error('onUploaded error', error)
      }
    }

    void onUploaded()
  }, [nativeIntent, state.filesToUpload.length, state.filesUploaded])
}
