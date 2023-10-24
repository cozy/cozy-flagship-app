import OsReceiveIntent from '@mythologi/react-native-receive-sharing-intent'
import RNFS from 'react-native-fs'

import { EventEmitter } from 'events'

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

const onReceiveFiles = (files: ReceivedFile[]): OsReceiveFile[] => {
  OsReceiveLogger.info('Received files', files)
  const processedFilesMap = processReceivedFiles(files)
  const filesArray = mapFilesToUploadToArray(processedFilesMap)

  return filesArray
}

class FileReceiver extends EventEmitter {
  receiveFiles(): void {
    OsReceiveIntent.getReceivedFiles(
      files =>
        this.emit('filesReceived', onReceiveFiles(files as ReceivedFile[])),
      error => this.emit('filesReceivedError', error),
      OS_RECEIVE_PROTOCOL_NAME
    )
  }

  clearReceivedFiles(): void {
    OsReceiveLogger.info('Clearing received files')
    OsReceiveIntent.clearReceivedFiles()
  }
}

export const OsReceiveEmitter = new FileReceiver()

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
