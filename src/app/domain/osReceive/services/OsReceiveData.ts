import { EventEmitter } from 'events'

import OsReceiveIntent from '@mythologi/react-native-receive-sharing-intent'
import RNFS from 'react-native-fs'

import {
  OsReceiveFile,
  OsReceiveFileStatus
} from '/app/domain/osReceive/models/OsReceiveState'
import { OsReceiveLogger } from '/app/domain/osReceive'
import { ReceivedFile } from '/app/domain/osReceive/models/ReceivedFile'
import { OS_RECEIVE_PROTOCOL_NAME } from '/constants/strings.json'
import { Media } from '/app/domain/backup/models'
import { getMimeType } from '/app/domain/backup/services/getMedias'

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

const decodeFileName = (fileName: string): string => decodeURI(fileName)

const determineMimeType = (fileName: string, mimeType: string): string =>
  getMimeType({
    name: decodeFileName(fileName),
    mimeType: mimeType.includes('/')
      ? mimeType
      : // Want to handle the case where mimeType is only the extension, shouldn't happen but better safe than sorry
        getMimeType({ name: fileName } as Media)
  } as Media)

const createOsReceiveFile = (file: ReceivedFile): OsReceiveFile => {
  const decodedFileName = decodeFileName(file.fileName)
  const mimeType = determineMimeType(file.fileName, file.mimeType)

  return {
    name: decodedFileName,
    file: {
      ...file,
      fromFlagship: true,
      filePath: decodeURI(file.filePath),
      fileName: decodedFileName,
      mimeType: mimeType
    },
    status: OsReceiveFileStatus.toUpload,
    type: mimeType
  }
}

const mapFilesToUploadToArray = (
  filesMap: Map<string, ReceivedFile>
): OsReceiveFile[] => {
  return Array.from(filesMap.values()).map(createOsReceiveFile)
}

const onReceiveFiles = (files: ReceivedFile[]): OsReceiveFile[] => {
  OsReceiveLogger.info('Received files', files)
  const processedFilesMap = processReceivedFiles(files)
  const filesArray = mapFilesToUploadToArray(processedFilesMap)

  return filesArray
}

export const _onReceiveFiles = onReceiveFiles // for testing

class FileReceiver extends EventEmitter {
  private activated = false

  private receiveFiles(): void {
    OsReceiveIntent.getReceivedFiles(
      files =>
        this.emit('filesReceived', onReceiveFiles(files as ReceivedFile[])),
      error => this.emit('filesReceivedError', error),
      OS_RECEIVE_PROTOCOL_NAME
    )
  }

  public clearReceivedFiles(): void {
    OsReceiveLogger.info('Clearing received files')
    OsReceiveIntent.clearReceivedFiles()
    this.activated = false
  }

  public ensureActivation(): void {
    if (this.activated) return
    OsReceiveLogger.info('Activating file receiver')
    this.activated = true
    this.receiveFiles()
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
