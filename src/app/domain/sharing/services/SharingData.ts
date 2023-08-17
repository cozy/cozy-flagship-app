import ReceiveSharingIntent from '@mythologi/react-native-receive-sharing-intent'

import { sharingLogger } from '/app/domain/sharing'
import {
  ReceivedFile,
  SHARING_PROTOCOL_NAME
} from '/app/domain/sharing/models/ReceivedFile'

const getDeduplicationKey = (file: ReceivedFile): string | null => {
  return file.filePath ?? null
}

const processReceivedFiles = (
  files: ReceivedFile[]
): Map<string, ReceivedFile> => {
  sharingLogger.info('Processing received files', files)

  const filesToUpload = new Map<string, ReceivedFile>()

  for (const file of files) {
    const key = getDeduplicationKey(file)

    if (key && !filesToUpload.has(key)) {
      sharingLogger.info('Adding file to upload', file)
      filesToUpload.set(key, file)
    } else {
      sharingLogger.info('File already added', file)
    }
  }

  return filesToUpload
}

const mapFilesToUploadToArray = (
  filesMap: Map<string, ReceivedFile>
): ReceivedFile[] => {
  return Array.from(filesMap.values())
}

const onReceiveFiles = (
  files: ReceivedFile[],
  callback?: (files: ReceivedFile[]) => void
): void => {
  sharingLogger.info('Received files', files)
  const processedFilesMap = processReceivedFiles(files)
  const filesArray = mapFilesToUploadToArray(processedFilesMap)

  callback?.(filesArray)
}

const onFailure = (error: unknown): void => {
  sharingLogger.error('Could not get received files', error)
}

export const handleReceivedFiles = (
  callback?: (files: ReceivedFile[]) => void
): void => {
  ReceiveSharingIntent.getReceivedFiles(
    files => onReceiveFiles(files, callback),
    onFailure,
    SHARING_PROTOCOL_NAME
  )
}
