import ReceiveSharingIntent from '@mythologi/react-native-receive-sharing-intent'

import Minilog from 'cozy-minilog'

import {
  isAndroidFile,
  isIOSFile,
  ReceivedFile
} from '/app/domain/sharing/models/ReceivedFile'
import { routes } from '/constants/routes'
import { navigate } from '/libs/RootNavigation'

const sharingLogger = Minilog('🗃️ SharingService')
const filesToUpload = new Map<string, ReceivedFile>()

// Add files to upload in a Map to avoid duplicates created by a bug in the library
// Map key key depends on the platform, typeguard allows us to benefit from type inference
const processReceivedFiles = (files: ReceivedFile[]): void => {
  sharingLogger.info('Processing received files', files)

  for (const file of files) {
    let key: string | undefined | null

    if (isAndroidFile(file)) {
      key = file.filePath
    } else if (isIOSFile(file)) {
      key = file.localIdentifier
    }

    if (key && !filesToUpload.has(key)) {
      sharingLogger.info('Adding file to upload', file)
      filesToUpload.set(key, file)
    } else {
      sharingLogger.info('File already added', file)
    }
  }
}

// Abstract the ReceiveSharingIntent dependency for easier testing
// This function is only exported for testing purposes
export const _handleReceivedFiles = (
  callback?: (files: ReceivedFile[]) => void
): void => {
  ReceiveSharingIntent.getReceivedFiles(
    files => {
      sharingLogger.info('Received files', files)

      processReceivedFiles(files)

      callback?.(files)

      if (hasFilesToUpload()) {
        sharingLogger.info('useGlobalAppState: handleWakeUp, sharing mode')
        navigate(routes.sharing)
      }
    },
    error => {
      sharingLogger.error('Could not get received files', error)
    },
    'ShareMedia'
  )
}

// Start listening for incoming files
_handleReceivedFiles()

const getFilesToUpload = (): Map<string, ReceivedFile> => {
  sharingLogger.info('Getting files to upload', filesToUpload)
  return filesToUpload
}

const hasFilesToUpload = (): boolean => {
  sharingLogger.info('Has files to upload', filesToUpload.size > 0)
  return filesToUpload.size > 0
}

const clearFilesToUpload = (): void => {
  sharingLogger.info('Clearing files to upload')
  filesToUpload.clear()
  ReceiveSharingIntent.clearReceivedFiles()
}

export { clearFilesToUpload, getFilesToUpload, hasFilesToUpload }
