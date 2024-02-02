import strings from '/constants/strings.json'
import { getDevConfig, initDev } from '/core/tools/dev'

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

const hasSentryEnabled = (): boolean =>
  enableSentryOn.some(environment => environment === name)

export const isDev = (): boolean => nameIs(strings.environments.test)

export const isTest = (): boolean => process.env.NODE_ENV === 'test'
/**
 * The native console.debug is used here,
 * because its color is more visible than minilog's color
 */
// eslint-disable-next-line no-console
export const devlog = isDev() && !isTest() ? console.debug : (): void => void 0

try {
  void initDev(isDev())
} catch (error) {
  devlog('failed to init dev env', error)
}

const {
  disableGetIndex,
  enableLocalSentry,
  cliskKonnectorDevMode,
  enableReduxLogger,
  enforcedInstallReferrer,
  forceInstallReferrer,
  enableKonnectorExtensiveLog,
  disableAutoLock
} = getDevConfig(isDev())

if (enableLocalSentry) toggleLocalSentry(true)

export const isSentryDebugMode = (): boolean => enableLocalSentry

export const shouldDisableGetIndex = (): boolean => disableGetIndex

export const shouldShowCliskDevMode = (): boolean => cliskKonnectorDevMode

export const shouldForceInstallReferrer = (): boolean => forceInstallReferrer
export const getEnforcedInstallReferrer = (): string => enforcedInstallReferrer

export const shouldEnableReduxLogger = (): boolean =>
  enableReduxLogger && !isTest()

export const shouldEnableKonnectorExtensiveLog = (): boolean =>
  enableKonnectorExtensiveLog

export const shouldDisableAutolock = (): boolean => disableAutoLock

export const EnvService = {
  name,
  nameIs,
  hasSentryEnabled,
  isDev
}
