import BackgroundGeolocation from 'react-native-background-geolocation'
import DeviceInfo from 'react-native-device-info'

import CozyClient, { Q, QueryDefinition, fetchPolicies } from 'cozy-client'

import { fetchSupportMail } from '/app/domain/logger/supportEmail'
import { devlog } from '/core/tools/env'

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
  devlog(`📍 Geolocation Plugin ${message}`)
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

export const buildServiceWebhookQuery = (): Query => {
  // See https://github.com/cozy/cozy-client/blob/c0c7fbf1307bb383debaa6bdb3c79c29c889dbc8/packages/cozy-stack-client/src/TriggerCollection.js#L132
  return {
    definition: Q('io.cozy.triggers').where({
      worker: 'service',
      type: '@webhook'
    }),
    options: {
      as: 'io.cozy.triggers/webhook/fetchOpenPathTripsWebhook',
      fetchPolicy: fetchPolicies.olderThan(60 * 60 * 1000)
    }
  }
}

interface Query {
  definition: QueryDefinition
  options: object
}
