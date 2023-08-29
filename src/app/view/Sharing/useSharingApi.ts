import { useEffect } from 'react'

import { useNativeIntent } from 'cozy-intent'

import { useSharingState } from '/app/view/Sharing/SharingState'
import { sharingLogger } from '/app/domain/sharing'

export const useSharingApi = (): void => {
  const state = useSharingState()
  const nativeIntent = useNativeIntent()

  useEffect(() => {
    if (state.filesUploaded.length === 0 || !nativeIntent) return
    const isLast = state.filesUploaded.length === state.filesToUpload.length

    const onUploaded = async (): Promise<void> => {
      sharingLogger.info('onUploaded called')

      try {
        const res = await nativeIntent.call(
          'drive.dev.192-168-1-65.nip.io',
          'onFileUploaded',
          state.filesUploaded[state.filesUploaded.length - 1],
          isLast ? state.filesUploaded.length : undefined
        )
        sharingLogger.info('onUploaded res', res)
      } catch (error) {
        sharingLogger.error('onUploaded error', error)
      }
    }

    void onUploaded()
  }, [nativeIntent, state.filesToUpload.length, state.filesUploaded])
}
