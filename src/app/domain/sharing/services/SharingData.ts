import OsReceiveIntent from '@mythologi/react-native-receive-sharing-intent'

import { OsReceiveLogger } from '/app/domain/sharing'
import {
  ReceivedFile,
  OS_RECEIVE_PROTOCOL_NAME
} from '/app/domain/sharing/models/ReceivedFile'

const getDeduplicationKey = (file: ReceivedFile): string | null => {
  return file.filePath ?? null
}

const processReceivedFiles = (
  files: ReceivedFile[]
): Map<string, ReceivedFile> => {
  OsReceiveLogger.info('Processing received files', files)

  const filesToUpload = new Map<string, ReceivedFile>()

  for (const file of files) {
    const key = getDeduplicationKey(file)

    if (key && !filesToUpload.has(key)) {
      OsReceiveLogger.info('Adding file to upload', file)
      filesToUpload.set(key, file)
    } else {
      OsReceiveLogger.info('File already added', file)
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
  OsReceiveLogger.info('Received files', files)
  const processedFilesMap = processReceivedFiles(files)
  const filesArray = mapFilesToUploadToArray(processedFilesMap)

  callback?.(filesArray)
}

const onFailure = (error: unknown): void => {
  OsReceiveLogger.error('Could not get received files', error)
}

type FileCallback = (files: ReceivedFile[]) => void
type CleanupFunction = () => void

export const handleReceivedFiles = (
  callback?: FileCallback
): CleanupFunction => {
  OsReceiveIntent.getReceivedFiles(
    files => onReceiveFiles(files as ReceivedFile[], callback),
    onFailure,
    OS_RECEIVE_PROTOCOL_NAME
  )

  return () => {
    OsReceiveIntent.clearReceivedFiles()
  }
}
