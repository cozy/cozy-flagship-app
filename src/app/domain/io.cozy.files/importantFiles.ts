import CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'

import { downloadFile } from '/app/domain/io.cozy.files/offlineFiles'
import {
  getImportantFiles
} from '/app/domain/io.cozy.files/remoteFiles'
import { getErrorMessage } from '/libs/functions/getErrorMessage'

const log = Minilog('📁 Offline Files')

const IMPORTANT_FILES_DOWNLOAD_DELAY_IN_MS = 100

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
  
    for (const importantFile of importantFiles) {
      log.debug(`Start downloading file ${importantFile._id}`)
      await downloadFile(importantFile, client)
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    log.error(`Something went wrong while making important files available offline: ${errorMessage}`)
  }
}
