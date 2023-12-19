import type { NavigationContainerRef, Route } from '@react-navigation/native'
import { Platform } from 'react-native'

import CozyClient from 'cozy-client'
import { getErrorMessage } from 'cozy-intent'

import {
  isAutoLockEnabled,
  isDeviceSecured
} from '/app/domain/authentication/models/Device'
import {
  PasswordParams,
  savePassword,
  SetKeys,
  hasDefinedPassword
} from '/app/domain/authentication/models/User'
import {
  ensureAutoLockIsEnabled,
  toggleSetting
} from '/app/domain/settings/services/SettingsService'
import { getDevModeFunctions } from '/app/domain/authorization/utils/devMode'
import { routes } from '/constants/routes'
import { devlog, shouldDisableAutolock } from '/core/tools/env'
import { getCurrentRoute, navigate, navigationRef } from '/libs/RootNavigation'
import { getInstanceAndFqdnFromClient } from '/libs/client'
import { authConstants } from '/app/domain/authorization/constants'
import { safePromise } from '/utils/safePromise'
import { navigateToApp } from '/libs/functions/openApp'
import { hideSplashScreen } from '/app/theme/SplashScreenService'
import { SecurityNavigationService } from '/app/domain/authorization/services/SecurityNavigationService'
import { getData, StorageKeys } from '/libs/localStore'

// Can use mock functions in dev environment
const fns = getDevModeFunctions(
  {
    isDeviceSecured,
    isAutoLockEnabled,
    hasDefinedPassword
  },
  {
    isDeviceSecured: shouldDisableAutolock()
      ? async (): Promise<boolean> => Promise.resolve(true)
      : undefined,
    isAutoLockEnabled: shouldDisableAutolock()
      ? async (): Promise<boolean> => Promise.resolve(false)
      : undefined,
    hasDefinedPassword: shouldDisableAutolock()
      ? async (): Promise<boolean> => Promise.resolve(true)
      : undefined
  }
)

let isSecurityFlowPassed = false

export const setIsSecurityFlowPassed = (value: boolean): void => {
  isSecurityFlowPassed = value
}

export const getIsSecurityFlowPassed = async (): Promise<boolean> => {
  if (isSecurityFlowPassed) return isSecurityFlowPassed

  try {
    const [isSecured, isAutoLock] = await Promise.all([
      fns.isDeviceSecured(),
      fns.isAutoLockEnabled()
    ])

    setIsSecurityFlowPassed(isSecured && !isAutoLock)

    return isSecurityFlowPassed
  } catch (error) {
    // This would be a huge error blocking the user from the application
    // In this case let's assume the security flow is passed to avoid locking the user out
    // In theory, this should never happen, but async functions can be unpredictable
    devlog('🔏', 'Error getting security flow status', error)
    setIsSecurityFlowPassed(true)
    return isSecurityFlowPassed
  }
}

export const determineSecurityFlow = async (
  client: CozyClient,
  navigationObject?: {
    navigation: NavigationContainerRef<Record<string, unknown>>
    href: string
    slug: string
  },
  isCallerHandlingSplashscreen?: boolean
): Promise<void> => {
  const callbackNav = async (): Promise<void> => {
    try {
      if (navigationObject) {
        await navigateToApp(navigationObject)
      } else navigate(routes.home)
    } catch (error) {
      devlog('🔏', 'Error navigating to app, defaulting to home', error)
      navigate(routes.home)
    } finally {
      setIsSecurityFlowPassed(true)
      SecurityNavigationService.stopListening()
    }
  }

  if (await fns.isAutoLockEnabled()) {
    devlog('🔏', 'Application has autolock activated')
    devlog('🔏', 'Device should be secured or autolock would not work')

    navigate(routes.lock, { onSuccess: callbackNav })
    void hideSplashScreen()
  } else if (await fns.isDeviceSecured()) {
    devlog('🔏', 'Application does not have autolock activated')
    devlog('🔏', 'Device is secured')
    devlog('🔏', 'No security action taken')

    if (navigationObject) await navigateToApp(navigationObject)

    // This might be redundant but some cases require a hideSplashScreen() failsafe
    // @TODO: should be refactored into a proper app-wide splashscreen handling service
    if (isCallerHandlingSplashscreen) {
      devlog(
        '🔏',
        'determineSecurityFlow received Splashscreen instruction from its caller, therefore will not hide it'
      )
    }

    if (!isCallerHandlingSplashscreen) {
      devlog(
        '🔏',
        "determineSecurityFlow didn't receive Splashscreen instruction from its caller, defaulting to hiding it"
      )

      SecurityNavigationService.stopListening()
      void hideSplashScreen()
    }
  } else {
    devlog('🔏', 'Application does not have autolock activated')
    devlog('🔏', 'Device is unsecured')

    const params = await getSecFlowInitParams(client)

    if (params.createPassword) {
      void hideSplashScreen() // This might be redundant but some cases require a hideSplashScreen() failsafe

      return navigate(routes.promptPassword, { onSuccess: callbackNav })
    } else {
      void hideSplashScreen() // This might be redundant but some cases require a hideSplashScreen() failsafe

      return navigate(routes.promptPin, { onSuccess: callbackNav })
    }
  }
}

export const getSecFlowInitParams = async (
  client: CozyClient
): Promise<{
  createPassword: boolean
}> => {
  const isCreatePinFlow = await fns.hasDefinedPassword(client)

  devlog(
    '🔓',
    `User ${
      isCreatePinFlow ? 'has a password set' : 'does not have a password set'
    } `
  )

  if (isCreatePinFlow) {
    devlog('🔏', 'User should set a PIN code method')

    return {
      createPassword: false
    }
  } else {
    devlog('🔏', 'User should create a password')

    return {
      createPassword: true
    }
  }
}

export const savePinCode = async (
  pinCode: string,
  onSuccess: () => void
): Promise<void> => {
  try {
    await toggleSetting('PINLock', { pinCode })

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!onSuccess) throw new Error('No success callback provided')
    onSuccess()
  } catch (error) {
    devlog('🔏', 'Error saving pin code, fallback navigation to home', error)
    navigate(routes.home)
  }
}

export const doPinCodeAutoLock = async (): Promise<void> => {
  try {
    const autoLockStatus = await ensureAutoLockIsEnabled()
    devlog('🔏', `AutoLock status is ${String(autoLockStatus)}`)
  } catch (error) {
    devlog('🔏', 'Error saving autoLock', error)
  }
}

async function safeSetKeysAsync(
  client: CozyClient,
  keys: SetKeys,
  onSuccess?: () => void
): Promise<void> {
  try {
    devlog('🔏', 'Saving password', keys)

    await savePassword(client, keys)

    navigate(routes.promptPin, { onSuccess })
  } catch (error) {
    devlog('🔏', 'Error saving password')
    devlog(getErrorMessage(error))

    // TODO-CRITICAL: Handle network errors on savePassword
    // Handle error as needed
    // setErrorMessage?
  }
}

export const getPasswordParams = (
  client: CozyClient,
  onSuccess?: () => void
): PasswordParams => {
  const { uri: instance, normalizedFqdn: fqdn } =
    getInstanceAndFqdnFromClient(client)

  return {
    fqdn,
    goBack: (): void => {
      navigationRef.goBack()
    },
    instance,
    kdfIterations: authConstants.kdfIterations,
    setKeys: (keys: SetKeys): void => {
      // Errors to be handled in `safeSetKeysAsync()`
      const setKeys = safePromise(safeSetKeysAsync)
      setKeys(client, keys, onSuccess)
    }
  }
}

const TIMEOUT_VALUE = 5 * 60 * 1000

/**
 * If we went to sleep while on the lock screen, we don't want to lock the app
 *
 * If we went to sleep on an iOS device, we don't want to check the timer and always autolock the app
 *
 * In any other case, we just check the inactivity timer and ask to lock the app if needed
 */
export const _shouldLockApp = (
  parsedRoute?: Route<string>,
  timeSinceLastActivity?: number
): boolean => {
  try {
    // Accessing a property of parsedRoute will throw an error if it's null or undefined
    if (parsedRoute?.name === routes.lock) return false
  } catch (error) {
    // If an error is thrown (i.e., parsedRoute is null or undefined), we default to locking the app
    return true
  }

  if (!timeSinceLastActivity || timeSinceLastActivity < 0) return true

  if (Platform.OS === 'ios') return true

  return timeSinceLastActivity > TIMEOUT_VALUE
}

const tryLockingApp = async (
  parsedRoute?: Route<string, { href: string; slug: string }>,
  client?: CozyClient
): Promise<void> => {
  devlog('tryLockingApp with', { parsedRoute, client })
  const { href, slug } = parsedRoute?.params ?? {}
  const hasParsedRoute = parsedRoute && href && slug

  return await determineSecurityFlow(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    client!,
    // Let's assume the parsedRoute could be undefined for unknown reasons
    // In that case we just don't pass the navigation object and the security flow will default to home
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    hasParsedRoute
      ? {
          navigation: navigationRef as NavigationContainerRef<
            Record<string, unknown>
          >,
          href,
          slug
        }
      : undefined
  )
}

export const handleSecurityFlowWakeUp = async (
  client: CozyClient
): Promise<void> => {
  const currentRoute = getCurrentRoute()
  let parsedRoute: Route<string, { href: string; slug: string }>

  try {
    if (!currentRoute) throw new Error('No current route')
    parsedRoute = JSON.parse(JSON.stringify(currentRoute)) as Route<
      string,
      { href: string; slug: string }
    >
  } catch (error) {
    devlog(
      'Could not parse the current route, defaulting to home screen:',
      currentRoute
    )
    parsedRoute = { name: routes.default } as Route<
      string,
      { href: string; slug: string }
    >
  }

  return getData<string>(StorageKeys.LastActivity)
    .then((lastActivity): number => {
      const now = Date.now()
      const lastActivityDate = new Date(parseInt(lastActivity ?? '0', 10))

      return now - lastActivityDate.getTime()
    })
    .then(timeSinceLastActivity => {
      if (_shouldLockApp(parsedRoute, timeSinceLastActivity))
        return tryLockingApp(parsedRoute, client)
      else {
        devlog(
          'handleWakeUp: no need to check the security status, hiding splash screen'
        )
        if (parsedRoute.name !== routes.lock) setIsSecurityFlowPassed(true)
        return hideSplashScreen()
      }
    })
    .catch(reason => devlog('Failed when waking up', reason))
}
