import BackgroundGeolocation from 'react-native-background-geolocation'
import DeviceInfo from 'react-native-device-info'

import CozyClient, { Q, fetchPolicies } from 'cozy-client'
import Minilog from 'cozy-minilog'

import { t } from '/locales/i18n'

const log = Minilog('📍 Geolocation')

export const getTs = (location: { timestamp: string }): number => {
  return parseISOString(location.timestamp).getTime() / 1000
}

export const parseISOString = (ISOString: string): Date => {
  const b = ISOString.split(/\D+/)
  // @ts-expect-error - Date.UTC() expects number arguments, not stringed numbers
  // But at the time of this refactoring, not feeling safe enough to change this
  return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]))
}

const Logger = BackgroundGeolocation.logger

export const Log = (message: string): void => {
  log.debug(message)
  Logger.debug(message)
}

export const getAllLogs = async (): Promise<string> => {
  return Logger.getLog()
}

export const sendLogFile = async (client?: CozyClient): Promise<boolean> => {
  const emailSupport = await fetchSupportMail(client)

  const appVersion = DeviceInfo.getVersion()
  const appBuild = DeviceInfo.getBuildNumber()
  Log(`App info: ${appVersion} (${appBuild})`)

  return Logger.emailLog(emailSupport)
}

const fetchSupportMail = async (client?: CozyClient): Promise<string> => {
  if (!client) {
    return t('support.email')
  }

  const result = (await client.fetchQueryAndGetFromState({
    definition: Q('io.cozy.settings').getById('io.cozy.settings.context'),
    options: {
      as: 'io.cozy.settings/io.cozy.settings.context',
      fetchPolicy: fetchPolicies.olderThan(60 * 60 * 1000)
    }
  })) as InstanceInfo

  return result.data?.[0]?.attributes?.support_address ?? t('support.email')
}

interface InstanceInfo {
  data?: {
    attributes?: {
      support_address?: string
    }
  }[]
}
