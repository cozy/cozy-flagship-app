import { Alert, PermissionsAndroid, Platform } from 'react-native'
import Mailer from 'react-native-mail'
import RNFS from 'react-native-fs'
import RNFetchBlob from 'rn-fetch-blob'
import DeviceInfo from 'react-native-device-info'

import type CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'

import { fetchSupportMail } from '/app/domain/logger/supportEmail'
import {
  hideSplashScreen,
  showSplashScreen,
  splashScreens
} from '/app/theme/SplashScreenService'
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

    const supportEmail = await fetchSupportMail(client)

    const { fqdn } = getInstanceAndFqdnFromClient(client)

    const instance = client.getStackClient().uri ?? 'not logged app'

    const subject = `DB files for ${instance}`

    const files = await RNFS.readDir(RNFS.DocumentDirectoryPath)

    const dbFiles = files.filter(f => f.name.startsWith(`${fqdn}_`))

    const externalFiles = []
    for (const dbFile of dbFiles) {
      const dirs = RNFetchBlob.fs.dirs

      const internalPath = dbFile.path

      if (Platform.OS === 'android') {
        const date = Number(new Date())
        const externalPath = `${dirs.DCIMDir}/DbFile_${dbFile.name}${date}.sqlite`

        await RNFS.copyFile(internalPath, externalPath)

        externalFiles.push({
          path: externalPath
        })
      } else {
        externalFiles.push({
          path: dbFile.path,
          type: 'pdf' // there is no compatible MIME type, so we use PDF one as replacement, this should change nothing expect the email aspect
        })
      }
    }

    await showSplashScreen(splashScreens.SEND_LOG_EMAIL)
    log.info('Start email intent', externalFiles)
    await sendMailPromise(subject, supportEmail, externalFiles).catch(
      (errorData: sendMailError) => {
        const { error, event } = errorData
        Alert.alert(
          error,
          event,
          [
            {
              text: 'Ok',
              onPress: (): void => log.debug('OK: Email Error Response')
            },
            {
              text: 'Cancel',
              onPress: (): void => log.debug('CANCEL: Email Error Response')
            }
          ],
          { cancelable: true }
        )
      }
    )
    log.info('Did finish email intent')
    await hideSplashScreen(splashScreens.SEND_LOG_EMAIL)
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    log.error('Error while trying to send DB email', errorMessage)
  }
}

const sendMailPromise = (
  subject: string,
  email: string,
  attachments: Attachment[]
): Promise<void> => {
  return new Promise((resolve, reject) => {
    Mailer.mail(
      {
        subject: subject,
        recipients: [email],
        body: buildMessageBody(),
        isHTML: true,
        attachments: attachments
      },
      (error, event) => {
        if (error) {
          reject({ error, event })
        } else {
          resolve()
        }
      }
    )
  })
}

const buildMessageBody = (): string => {
  const appVersion = DeviceInfo.getVersion()
  const appBuild = DeviceInfo.getBuildNumber()
  const bundle = DeviceInfo.getBundleId()
  const deviceBrand = DeviceInfo.getBrand()
  const deviceModel = DeviceInfo.getModel()
  const os = DeviceInfo.getSystemName()
  const version = DeviceInfo.getSystemVersion()

  const appInfo = `App info: ${appVersion} (${appBuild})`
  const bundleInfo = `App bundle: ${bundle}`
  const deviceInfo = `Device info: ${deviceBrand} ${deviceModel} ${os} ${version}`

  return `${appInfo}\n${bundleInfo}\n${deviceInfo}`
}

interface sendMailError {
  error: string
  event?: string
}

interface Attachment {
  path: string
}
