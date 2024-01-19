import { FileLogger, LogLevel } from 'react-native-file-logger'

import type CozyClient from 'cozy-client'

import { fetchSupportMail } from '/app/domain/logger/supportEmail'
import strings from '/constants/strings.json'

export const configureFileLogger = async (): Promise<void> => {
  await FileLogger.configure({
    logLevel: LogLevel.Info
  })
}

export const isSendLogsDeepLink = (url: string): boolean => {
  const deepLinks = [
    `${strings.COZY_SCHEME}sendlogs`,
    `${strings.UNIVERSAL_LINK_BASE}/sendlogs`
  ]

  return deepLinks.includes(url.toLowerCase())
}

export const sendLogs = async (client?: CozyClient): Promise<void> => {
  const supportEmail = await fetchSupportMail(client)

  const instance = client?.getStackClient().uri ?? 'not logged app'

  const subject = `Log file for ${instance}`

  await FileLogger.sendLogFilesByEmail({
    to: supportEmail,
    subject: subject
  })
}
