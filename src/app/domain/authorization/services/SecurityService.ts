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
import {
  hideSecurityScreen,
  lockScreens,
  showSecurityScreen
} from '/app/view/Lock/useLockScreenWrapper'
import { devlog, shouldDisableAutolock } from '/core/tools/env'
import { navigationRef } from '/libs/RootNavigation'
import { getInstanceAndFqdnFromClient } from '/libs/client'
import { authConstants } from '/app/domain/authorization/constants'
import { safePromise } from '/utils/safePromise'
import { hideSplashScreen, splashScreens } from '/app/theme/SplashScreenService'
import { getData, CozyPersistedStorageKeys } from '/libs/localStore'

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

export const determineSecurityFlow = async (
  client: CozyClient
): Promise<void> => {
  if (await fns.isAutoLockEnabled()) {
    devlog('🔏', 'Application has autolock activated')
    devlog('🔏', 'Device should be secured or autolock would not work')

    showSecurityScreen(lockScreens.LOCK_SCREEN)
  } else if (await fns.isDeviceSecured()) {
    devlog('🔏', 'Application does not have autolock activated')
    devlog('🔏', 'Device is secured')
    devlog('🔏', 'No security action taken')
  } else {
    devlog('🔏', 'Application does not have autolock activated')
    devlog('🔏', 'Device is unsecured')

    const params = await getSecFlowInitParams(client)

    if (params.createPassword) {
      return showSecurityScreen(lockScreens.PASSWORD_PROMPT)
    } else {
      return showSecurityScreen(lockScreens.PIN_PROMPT)
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

export const savePinCode = async (pinCode: string): Promise<void> => {
  try {
    await toggleSetting('PINLock', { pinCode })
  } catch (error) {
    devlog('🔏', 'Error saving pin code, fallback navigation to home', error)
  }
  hideSecurityScreen(lockScreens.SET_PIN)
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
  keys: SetKeys
): Promise<void> {
  try {
    devlog('🔏', 'Saving password', keys)

    await savePassword(client, keys)

    showSecurityScreen(lockScreens.PIN_PROMPT)
  } catch (error) {
    devlog('🔏', 'Error saving password')
    devlog(getErrorMessage(error))

    // TODO-CRITICAL: Handle network errors on savePassword
    // Handle error as needed
    // setErrorMessage?
  }
}

export const getPasswordParams = (client: CozyClient): PasswordParams => {
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
      setKeys(client, keys)
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
export const _shouldLockApp = (timeSinceLastActivity?: number): boolean => {
  if (!timeSinceLastActivity || timeSinceLastActivity < 0) return true

  if (Platform.OS === 'ios') return true

  return timeSinceLastActivity > TIMEOUT_VALUE
}

const tryLockingApp = async (client?: CozyClient): Promise<void> => {
  devlog('tryLockingApp with', { client })
  return await determineSecurityFlow(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    client!
  )
}

export const handleSecurityFlowWakeUp = async (
  client: CozyClient
): Promise<void> => {
  return getData<string>(CozyPersistedStorageKeys.LastActivity)
    .then((lastActivity): number => {
      const now = Date.now()
      const lastActivityDate = new Date(parseInt(lastActivity ?? '0', 10))

      return now - lastActivityDate.getTime()
    })
    .then(timeSinceLastActivity => {
      if (_shouldLockApp(timeSinceLastActivity)) {
        return tryLockingApp(client)
      }

      devlog('handleWakeUp: no need to check the security status')
      return hideSplashScreen(splashScreens.LOCK_SCREEN)
    })
    .catch(reason => devlog('Failed when waking up', reason))
}
