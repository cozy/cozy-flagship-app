import CozyClient from 'cozy-client'

import {
  disableLogs,
  enableLogs,
  sendLogs
} from '/app/domain/logger/fileLogger'
import strings from '/constants/strings.json'

export const handleLogsDeepLink = (
  url: string,
  client?: CozyClient
): boolean => {
  if (isSendLogsDeepLink(url)) {
    void sendLogs(client)

    return true
  }

  if (isEnableLogsDeepLink(url)) {
    void enableLogs()

    return true
  }

  if (isDisableLogsDeepLink(url)) {
    void disableLogs()

    return true
  }

  return false
}

const isSendLogsDeepLink = (url: string): boolean => {
  const deepLinks = [
    `${strings.COZY_SCHEME}sendlogs`,
    `${strings.UNIVERSAL_LINK_BASE}/sendlogs`
  ]

  return deepLinks.includes(url.toLowerCase())
}

const isEnableLogsDeepLink = (url: string): boolean => {
  const deepLinks = [
    `${strings.COZY_SCHEME}enablelogs`,
    `${strings.UNIVERSAL_LINK_BASE}/enablelogs`
  ]

  return deepLinks.includes(url.toLowerCase())
}

const isDisableLogsDeepLink = (url: string): boolean => {
  const deepLinks = [
    `${strings.COZY_SCHEME}disablelogs`,
    `${strings.UNIVERSAL_LINK_BASE}/disablelogs`
  ]

  return deepLinks.includes(url.toLowerCase())
}
