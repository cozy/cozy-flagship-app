import { differenceInMonths } from 'date-fns'
import RNFS from 'react-native-fs'

import CozyClient from 'cozy-client'
import type { FileDocument } from 'cozy-client/types/types'
import Minilog from 'cozy-minilog'

import { downloadFile } from '/app/domain/io.cozy.files/offlineFiles'
import {
  getOfflineFilesConfiguration,
  removeOfflineFileFromConfiguration,
} from '/app/domain/io.cozy.files/offlineFilesConfiguration'
import {
  getImportantFiles
} from '/app/domain/io.cozy.files/remoteFiles'
import { getErrorMessage } from '/libs/functions/getErrorMessage'

const log = Minilog('📁 Offline Files')

const IMPORTANT_FILES_DOWNLOAD_DELAY_IN_MS = 100
const NB_OF_MONTH_BEFORE_EXPIRATION = 1

export const makeImportantFilesAvailableOfflineInBackground = async (client: CozyClient) => {
  return new Promise(resolve => {
    setTimeout(async () => {
      makeImportantFilesAvailableOffline(client).then(resolve)
    }, IMPORTANT_FILES_DOWNLOAD_DELAY_IN_MS)
  })
}

const makeImportantFilesAvailableOffline = async (client: CozyClient) => {
  try {
    log.debug('Start downloading important files for offline support')
    const importantFiles = await getImportantFiles(client)
  
    await cleanOldNonImportantFiles(importantFiles)
  
    for (const importantFile of importantFiles) {
      log.debug(`Start downloading file ${importantFile._id}`)
      await downloadFile(importantFile, client)
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    log.error(`Something went wrong while making important files available offline: ${errorMessage}`)
  }
}

const cleanOldNonImportantFiles = async (importantFiles: FileDocument[]) => {
  try {
    const offlineFiles = await getOfflineFilesConfiguration()
    const offlineFilesMap = Array.from(offlineFiles)
  
    const importantFilesIds = importantFiles.map(file => file._id)
  
    const now = new Date()
  
    for (const [key, offlineFile] of offlineFilesMap) {
      if (!importantFilesIds.includes(offlineFile.id) && (differenceInMonths(offlineFile.lastOpened, now) > NB_OF_MONTH_BEFORE_EXPIRATION || !offlineFile.lastOpened)) {
        log.debug(`Remove old unimportant file ${offlineFile.id} (cached on ${offlineFile.lastOpened})`)
        if (await RNFS.exists(offlineFile.path)) {
          await RNFS.unlink(offlineFile.path)
        }
        await removeOfflineFileFromConfiguration(offlineFile.id)
      }
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    log.error(`Something went wrong while cleaning non-important files: ${errorMessage}`)
  }
}
