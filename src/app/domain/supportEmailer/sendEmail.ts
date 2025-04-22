import { Alert } from 'react-native'
import Mailer from 'react-native-mail'
import DeviceInfo from 'react-native-device-info'

import type CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'

import { fetchSupportMail } from '/app/domain/logger/supportEmail'
import {
  hideSplashScreen,
  showSplashScreen,
  splashScreens
} from '/app/theme/SplashScreenService'

const log = Minilog('🗒️ Support Mailer')

interface sendMailError {
  error: string
  event?: string
}

export const sendEmailToSupport = async (
  subject: string,
  link: string,
  client: CozyClient
): Promise<void> => {
  const supportEmail = await fetchSupportMail(client)

  const instance = client.getStackClient().uri ?? 'not logged app'

  const fullSubject = `${subject} for ${instance}`

  await showSplashScreen(splashScreens.SEND_LOG_EMAIL)
  log.info('Start email intent')

  await sendMailPromise(fullSubject, supportEmail, link).catch(
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
