import { format } from 'date-fns'
import { PermissionsAndroid } from 'react-native'
import RNFS from 'react-native-fs'
import DeviceInfo from 'react-native-device-info'

import type CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'

import { getPerformancesLogs } from '/app/domain/performances/measure'
import { sendEmailToSupport } from '/app/domain/supportEmailer/sendEmail'
import { uploadFilesToSupportFolder } from '/app/domain/supportEmailer/uploadFiles'
import { getInstanceAndFqdnFromClient } from '/libs/client'
import { getErrorMessage } from '/libs/functions/getErrorMessage'
import { normalizeFqdn } from '/libs/functions/stringHelpers'

const log = Minilog('🗒️ Performances Mailer')

export const sendPerformancesByEmail = async (
  client?: CozyClient
): Promise<void> => {
  log.info('Send Performances by email')
  log.debug(getPerformancesLogs())

  if (!client) {
    log.info('SendPerformancesByEmail called with no client, return')
    return
  }

  try {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    await PermissionsAndroid.request(permission)

    const { fqdn } = getInstanceAndFqdnFromClient(client)

    const date = format(new Date(), 'yyyyMMdd_HHmmss_SSS')

    const normalizedFqdn = normalizeFqdn(fqdn)

    const performanceFolderPath = `${RNFS.DocumentDirectoryPath}/${normalizedFqdn}/Performances`

    await RNFS.mkdir(performanceFolderPath)
    const deviceName = await DeviceInfo.getDeviceName()

    const performanceFileName = `Performances_${date}_${deviceName}.json`
    const performanceFilePath = `${performanceFolderPath}/${performanceFileName}`

    await RNFS.writeFile(performanceFilePath, getPerformancesLogs())

    const subject = 'Performance files'

    const performanceFile = {
      name: performanceFileName,
      path: performanceFilePath,
      mimetype: '.json'
    }
    const link = await uploadFilesToSupportFolder([performanceFile], client)

    await sendEmailToSupport(subject, link, client)
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    log.error('Error while trying to send performances email', errorMessage)
  }
}
