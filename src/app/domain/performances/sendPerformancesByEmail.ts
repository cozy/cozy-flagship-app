import { format } from 'date-fns'
import { Alert, PermissionsAndroid } from 'react-native'
import Mailer from 'react-native-mail'
import RNFS from 'react-native-fs'
import DeviceInfo from 'react-native-device-info'

import type CozyClient from 'cozy-client'
// @ts-expect-error Not typed
import { getSharingLink } from 'cozy-client/dist/models/sharing'
import Minilog from 'cozy-minilog'

import { fetchSupportMail } from '/app/domain/logger/supportEmail'
import { getPerformancesLogs } from '/app/domain/performances/measure'
import { uploadFileWithConflictStrategy } from '/app/domain/upload/services'
import {
  hideSplashScreen,
  showSplashScreen,
  splashScreens
} from '/app/theme/SplashScreenService'
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

    const supportEmail = await fetchSupportMail(client)

    const { fqdn } = getInstanceAndFqdnFromClient(client)

    const instance = client.getStackClient().uri ?? 'not logged app'

    const subject = `Performance files for ${instance}`

    const token = client.getStackClient().token.accessToken

    if (!token) {
      throw new Error('No token found')
    }

    const date = format(new Date(), 'yyyyMMdd_HHmmss_SSS')
    const existingLogsFolderId = await client
      .collection('io.cozy.files')
      .ensureDirectoryExists(`/Settings/AALogs/${date}`)

    const normalizedFqdn = normalizeFqdn(fqdn)

    const performanceFolderPath = `${RNFS.DocumentDirectoryPath}/${normalizedFqdn}/Performances`

    await RNFS.mkdir(performanceFolderPath)

    const performanceFileName = `Performances${date}.json`
    const performanceFilePath = `${performanceFolderPath}/${performanceFileName}`

    await RNFS.writeFile(performanceFilePath, getPerformancesLogs())

    const url = getUrl(client, existingLogsFolderId, performanceFileName)

    log.info('Send file', performanceFileName)
    await uploadFileWithConflictStrategy({
      url,
      token,
      filename: performanceFileName,
      filepath: performanceFilePath,
      mimetype: '.json'
    })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const link: string = await getSharingLink(client, [existingLogsFolderId])

    await showSplashScreen(splashScreens.SEND_LOG_EMAIL)
    log.info('Start email intent')
    await sendMailPromise(subject, supportEmail, link).catch(
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
    log.error('Error while trying to send performances email', errorMessage)
  }
}

const sendMailPromise = (
  subject: string,
  email: string,
  link: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    Mailer.mail(
      {
        subject: subject,
        recipients: [email],
        body: buildMessageBody(link),
        isHTML: true
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

const buildMessageBody = (link: string): string => {
  const appVersion = DeviceInfo.getVersion()
  const appBuild = DeviceInfo.getBuildNumber()
  const bundle = DeviceInfo.getBundleId()
  const deviceBrand = DeviceInfo.getBrand()
  const deviceModel = DeviceInfo.getModel()
  const os = DeviceInfo.getSystemName()
  const version = DeviceInfo.getSystemVersion()

  const linkText = `Link: ${link}`
  const appInfo = `App info: ${appVersion} (${appBuild})`
  const bundleInfo = `App bundle: ${bundle}`
  const deviceInfo = `Device info: ${deviceBrand} ${deviceModel} ${os} ${version}`

  return `${linkText}${appInfo}\n${bundleInfo}\n${deviceInfo}`
}

const getUrl = (client: CozyClient, dirId: string, name: string): string => {
  const createdAt = new Date().toISOString()
  const modifiedAt = new Date().toISOString()

  const toURL = new URL(client.getStackClient().uri)
  toURL.pathname = `/files/${dirId}`
  toURL.searchParams.append('Name', name)
  toURL.searchParams.append('Type', 'file')
  toURL.searchParams.append('Tags', 'library')
  toURL.searchParams.append('Executable', 'false')
  toURL.searchParams.append('CreatedAt', createdAt)
  toURL.searchParams.append('UpdatedAt', modifiedAt)

  return toURL.toString()
}

interface sendMailError {
  error: string
  event?: string
}
