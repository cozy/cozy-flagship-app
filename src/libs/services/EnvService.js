import strings from '/strings.json'
import { devConfig } from '/config/dev'

let enableSentryOn = [strings.environments.production]

const envNames = {
  isTest: strings.environments.test,
  isProduction: strings.environments.production
}

const envStatus = {
  isTest: __DEV__,
  isProduction: !__DEV__
}

const toggleLocalSentry = (shouldLog = false) =>
  shouldLog
    ? (enableSentryOn = [...enableSentryOn, strings.environments.test])
    : (enableSentryOn = enableSentryOn.filter(
        environment => environment !== strings.environments.test
      ))

const name = envNames[Object.entries(envStatus).find(value => value[1])[0]]

const nameIs = envName => envName === name

if (devConfig.sentry) toggleLocalSentry(true)

const hasSentryEnabled = enableSentryOn.some(
  environment => environment === name
)

export const EnvService = {
  name,
  nameIs,
  hasSentryEnabled
}
