import { Alert, PermissionsAndroid } from 'react-native'
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

  const subject = `DB file for ${instance}`

  const files = await RNFS.readDir(RNFS.DocumentDirectoryPath)

  const dbFiles = files.filter(f => f.name.startsWith(`${fqdn}_`))

  const externalFiles = []
  for (const dbFile of dbFiles) {
    const dirs = RNFetchBlob.fs.dirs

    const internalPath = dbFile.path

    const date = Number(new Date())
    const externalPath = `${dirs.DCIMDir}/DbFile_${dbFile.name}${date}.sqlite`

    await RNFS.copyFile(internalPath, externalPath)

    externalFiles.push({
      path: externalPath
    })
  }

  await showSplashScreen(splashScreens.SEND_LOG_EMAIL)
  log.info('Start email intent')
  Mailer.mail(
    {
      subject: subject,
      recipients: [supportEmail],
      body: buildMessageBody(),
      customChooserTitle: 'This is my new title', // Android only (defaults to "Send Mail")
      isHTML: true,
      attachments: externalFiles
    },
    (error, event) => {
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
    
}
catch (err) {
  console.log('🍎 ERORR WHILE EMAIL', err.message)
}
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
