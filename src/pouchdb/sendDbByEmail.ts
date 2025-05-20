import { PermissionsAndroid } from 'react-native'
import RNFS from 'react-native-fs'

import type CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'

import { sendEmailToSupport } from '/app/domain/supportEmailer/sendEmail'
import { uploadFilesToSupportFolder } from '/app/domain/supportEmailer/uploadFiles'
import { getInstanceAndFqdnFromClient } from '/libs/client'
import { getErrorMessage } from '/libs/functions/getErrorMessage'

const log = Minilog('🗒️ DB Mailer')

export const sendDbByEmail = async (client?: CozyClient): Promise<void> => {
  log.info('Send DB by email')

  if (!client) {
    log.info('SendDbByEmail called with no client, return')
    return
  }

  try {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    await PermissionsAndroid.request(permission)

    const { fqdn } = getInstanceAndFqdnFromClient(client)

    const files = await RNFS.readDir(
      RNFS.DocumentDirectoryPath + '/../databases'
    )

    const dbFiles = files.filter(f => f.name.startsWith(`${fqdn}_`))

    const subject = 'DB files'

    const emailedFiles = dbFiles.map(dbFile => {
      return {
        name: dbFile.name,
        path: dbFile.path,
        mimetype: '.sqlite'
      }
    })
    const link = await uploadFilesToSupportFolder(emailedFiles, client)
    await sendEmailToSupport(subject, link, client)
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    log.error('Error while trying to send DB email', errorMessage)
  }
}
