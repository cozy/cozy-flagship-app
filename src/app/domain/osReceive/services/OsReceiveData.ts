import OsReceiveIntent from '@mythologi/react-native-receive-sharing-intent'
import RNFS from 'react-native-fs'

import {
  OsReceiveFile,
  OsReceiveFileStatus
} from '/app/domain/osReceive/models/OsReceiveState'
import { OsReceiveLogger } from '/app/domain/osReceive'
import {
  ReceivedFile,
  OS_RECEIVE_PROTOCOL_NAME
} from '/app/domain/osReceive/models/ReceivedFile'

const getDeduplicationKey = (file: ReceivedFile): string | null => {
  return file.filePath
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
): OsReceiveFile[] => {
  return Array.from(filesMap.values()).map(file => ({
    name: file.fileName,
    file,
    status: OsReceiveFileStatus.toUpload,
    type: file.mimeType
  }))
}

const onReceiveFiles = (
  files: ReceivedFile[],
  callback?: (files: OsReceiveFile[]) => void
): void => {
  OsReceiveLogger.info('Received files', files)
  const processedFilesMap = processReceivedFiles(files)
  const filesArray = mapFilesToUploadToArray(processedFilesMap)

  callback?.(filesArray)
}

const onFailure = (error: unknown): void => {
  OsReceiveLogger.error('Could not get received files', error)
}

type FileCallback = (files: OsReceiveFile[]) => void
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

export const getBase64FromReceivedFile = async (
  filePath: string
): Promise<string | null> => {
  try {
    return await RNFS.readFile(filePath, 'base64')
  } catch (error) {
    OsReceiveLogger.error('getBase64FromReceivedFile: error', error)
    return null
  }
}
