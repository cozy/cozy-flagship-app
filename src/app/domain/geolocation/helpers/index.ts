import BackgroundGeolocation from 'react-native-background-geolocation'

import Minilog from 'cozy-minilog'

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

export const sendLogFile = (): Promise<boolean> => {
  return Logger.emailLog('')
}
