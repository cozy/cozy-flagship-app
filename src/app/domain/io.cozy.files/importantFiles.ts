import CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'

import { downloadFile } from '/app/domain/io.cozy.files/offlineFiles'
import {
  getOfflineFilesConfiguration,
  removeOfflineFileFromConfiguration
} from '/app/domain/io.cozy.files/offlineFilesConfiguration'
import { getImportantFiles } from '/app/domain/io.cozy.files/remoteFiles'
import { getErrorMessage } from '/libs/functions/getErrorMessage'

const log = Minilog('📁 Offline Files')

const IMPORTANT_FILES_DOWNLOAD_DELAY_IN_MS = 100

export const makeImportantFilesAvailableOfflineInBackground = (
  client: CozyClient
): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      makeImportantFilesAvailableOffline(client)
        .then(resolve)
        .catch(error => {
          const errorMessage = getErrorMessage(error)
          log.error(
            `Something went wrong while making important files available offline: ${errorMessage}`,
            resolve()
          )
        })
    }, IMPORTANT_FILES_DOWNLOAD_DELAY_IN_MS)
  })
}

const makeImportantFilesAvailableOffline = async (
  client: CozyClient
): Promise<void> => {
  log.debug('Start downloading important files for offline support')
  const importantFiles = await getImportantFiles(client)

  for (const importantFile of importantFiles) {
    log.debug(`Start downloading file ${importantFile._id}`)
    await downloadFile(importantFile, client)
  }
}
