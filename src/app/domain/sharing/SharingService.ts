import ReceiveSharingIntent from '@mythologi/react-native-receive-sharing-intent'

import Minilog from 'cozy-minilog'

const filesToUpload: Record<string, unknown>[] = []
let isServiceInitialized = false

const sharingLogger = Minilog('🗃️ SharingService')

const initSharingMode = (): void => {
  sharingLogger.info('Init sharing mode')

  if (isServiceInitialized) {
    sharingLogger.info('Service already initialized')
    return // Exit early if the service is already initialized
  }

  ReceiveSharingIntent.getReceivedFiles(
    files => {
      sharingLogger.info('Received files', files)
      setFilesToUpload(files)
    },
    error => {
      sharingLogger.error('Could not get received files', error)
    },
    'ShareMedia'
  )

  sharingLogger.info('Service initialized')
  isServiceInitialized = true
}

const isSharingMode = (): boolean => {
  sharingLogger.info('Is sharing mode', filesToUpload.length > 0)
  return filesToUpload.length > 0
}

const setFilesToUpload = (files: Record<string, unknown>[]): void => {
  sharingLogger.info('Setting files to upload', files)
  filesToUpload.push(...files)
}

const getFilesToUpload = (): Record<string, unknown>[] => {
  sharingLogger.info('Getting files to upload', filesToUpload)
  return filesToUpload
}

const hasFilesToUpload = (): boolean => {
  sharingLogger.info('Has files to upload', filesToUpload.length > 0)
  return filesToUpload.length > 0
}

export {
  initSharingMode,
  isSharingMode,
  setFilesToUpload,
  getFilesToUpload,
  hasFilesToUpload
}
