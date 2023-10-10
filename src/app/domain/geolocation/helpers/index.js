import BackgroundGeolocation from 'react-native-background-geolocation'

export const getTs = location => {
  return parseISOString(location.timestamp).getTime() / 1000
}

export const parseISOString = ISOString => {
  let b = ISOString.split(/\D+/)
  return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]))
}

const Logger = BackgroundGeolocation.logger

export const Log = message => {
  // eslint-disable-next-line no-console
  console.log(message)
  Logger.debug(message)
}

export const getAllLogs = async () => {
  return Logger.getLog()
}

export const sendLogFile = () => {
  return Logger.emailLog('')
}
