import { useEffect } from 'react'

import {
  getFilesToUpload,
  initSharingMode
} from '/app/domain/sharing/SharingService'

export const useSharingMode = (): {
  filesToUpload: Record<string, unknown>[]
} => {
  useEffect(() => {
    initSharingMode()
  }, [])

  return {
    filesToUpload: getFilesToUpload()
  }
}
