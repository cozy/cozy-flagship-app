import ReceiveSharingIntent from '@mythologi/react-native-receive-sharing-intent'

import Minilog from 'cozy-minilog'

import {
  isAndroidFile,
  isIOSFile,
  ReceivedFile
} from '/app/domain/sharing/models/ReceivedFile'

export const sharingLogger = Minilog('🗃️ SharingService')
const filesToUpload = new Map<string, ReceivedFile>()

// Add files to upload in a Map to avoid duplicates created by a bug in the library
// Map key key depends on the platform, typeguard allows us to benefit from type inference
const processReceivedFiles = (files: ReceivedFile[]): void => {
  sharingLogger.info('Processing received files', files)

  // We don't want to keep files from a previous sharing session
  if (filesToUpload.size > 0) {
    sharingLogger.info('Clearing files to upload')
    filesToUpload.clear()
  }

  // Populate the `filesToUpload` Map with the files to upload
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

const getFilesToUploadAsArray = (): ReceivedFile[] => {
  return Array.from(getFilesToUpload().values())
}

export const getFilesToUpload = (): Map<string, ReceivedFile> => {
  sharingLogger.info('Getting files to upload', filesToUpload)
  return filesToUpload
}

export const hasFilesToUpload = (): boolean => {
  sharingLogger.info('Has files to upload', filesToUpload.size > 0)
  return filesToUpload.size > 0
}

// Abstract the ReceiveSharingIntent dependency in a callback handler to be initialized in the app
export const handleReceivedFiles = (
  callback?: (files: ReceivedFile[]) => void
): void => {
  ReceiveSharingIntent.getReceivedFiles(
    files => {
      sharingLogger.info('Received files', files)

      processReceivedFiles(files)

      callback?.(getFilesToUploadAsArray())
    },
    error => {
      sharingLogger.error('Could not get received files', error)
    },
    'ShareMedia'
  )
}
