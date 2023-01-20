import strings from '/constants/strings.json'
import { devConfig } from '/constants/dev-config'

let enableSentryOn = [strings.environments.production]

const envNames = {
  isTest: strings.environments.test,
  isProduction: strings.environments.production
} as Record<string, string>

const envStatus = {
  isTest: __DEV__,
  isProduction: !__DEV__
} as Record<string, boolean>

const toggleLocalSentry = (shouldLog = false): void => {
  shouldLog
    ? (enableSentryOn = [...enableSentryOn, strings.environments.test])
    : (enableSentryOn = enableSentryOn.filter(
        environment => environment !== strings.environments.test
      ))
}

const name =
  envNames[
    Object.entries(envStatus).find(value => value[1])?.[0] ??
      strings.environments.test
  ]

const nameIs = (envName: string): boolean => envName === name

if (devConfig.sentry) toggleLocalSentry(true)

const hasSentryEnabled = enableSentryOn.some(
  environment => environment === name
)

export const isDev = (): boolean => nameIs(strings.environments.test)

/**
 * The native console.debug is used here,
 * because its color is more visible than minilog's color
 */
// eslint-disable-next-line no-console
export const devlog = isDev() ? console.debug : (): void => void 0

export const EnvService = {
  name,
  nameIs,
  hasSentryEnabled,
  isDev
}
