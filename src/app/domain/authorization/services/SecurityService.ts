import CozyClient from 'cozy-client'

import {
  isAutoLockEnabled,
  isDeviceSecured
} from '/app/domain/authentication/models/Device'
import {
  PasswordParams,
  savePassword,
  SetKeys,
  shouldCreatePassword
} from '/app/domain/authentication/models/User'
import {
  ensureAutoLockIsEnabled,
  toggleSetting
} from '/app/domain/settings/services/SettingsService'
import { getDevModeFunctions } from '/app/domain/authorization/utils/devMode'
import { routes } from '/constants/routes'
import { devlog } from '/core/tools/env'
import { navigate, navigationRef, reset } from '/libs/RootNavigation'
import { getFqdnFromClient } from '/libs/client'

import { getErrorMessage } from 'cozy-intent'

import { authConstants } from '../constants'

import { safePromise } from '/utils/safePromise'

const showLockView = (): void => {
  reset(routes.lock)
}

// Can use mock functions in dev environment
// async (): Promise<boolean> => Promise.resolve(false)
const fns = getDevModeFunctions(
  {
    isDeviceSecured,
    isAutoLockEnabled,
    shouldCreatePassword
  },
  {
    isDeviceSecured: undefined,
    isAutoLockEnabled: undefined,
    shouldCreatePassword: undefined
  }
)

export const determineSecurityFlow = async (
  client: CozyClient
): Promise<void> => {
  if (await fns.isAutoLockEnabled()) {
    devlog('🔒', 'Application has autolock activated')
    devlog('🔒', 'Device should be secured or autolock would not work')

    showLockView()
  } else if (await fns.isDeviceSecured()) {
    devlog('🔓', 'Application does not have autolock activated')
    devlog('🔒', 'Device is secured')

    navigate(routes.home)
  } else {
    devlog('🔓', 'Application does not have autolock activated')
    devlog('🔓', 'Device is unsecured')

    const params = await getSecFlowInitParams(client)

    if (params.createPassword) {
      return reset(routes.promptPassword)
    } else {
      return reset(routes.promptPin)
    }
  }
}

export const getSecFlowInitParams = async (
  client: CozyClient
): Promise<{
  createPassword: boolean
}> => {
  const isCreatePasswordFlow = await fns.shouldCreatePassword(client)

  devlog(
    '🔓',
    `User ${
      isCreatePasswordFlow
        ? 'does not have a password set'
        : 'has a password set'
    } `
  )

  if (isCreatePasswordFlow) {
    devlog('🔓', 'User should create a password')

    return {
      createPassword: true
    }
  } else {
    devlog('🔓', 'User should set a PIN code method')

    return {
      createPassword: false
    }
  }
}

export const savePinCode = async (pinCode: string): Promise<void> => {
  try {
    await toggleSetting('PINLock', { pinCode })
  } catch (error) {
    devlog('🔓', 'Error saving pin code', error)
  } finally {
    devlog('🔓', 'PIN code saved, navigating to home')
    reset(routes.home)
  }
}

export const startPinCode = async (): Promise<void> => {
  try {
    const autoLockStatus = await ensureAutoLockIsEnabled()
    devlog('🔓', `AutoLock status is ${String(autoLockStatus)}`)
  } catch (error) {
    devlog('🔓', 'Error saving autoLock', error)
  }
}

async function safeSetKeysAsync(
  client: CozyClient,
  keys: SetKeys
): Promise<void> {
  try {
    devlog('🔓', 'Saving password', keys)

    await savePassword(client, keys)
    navigate(routes.promptPin)
  } catch (error) {
    devlog('🔓', 'Error saving password')
    devlog(getErrorMessage(error))

    // TODO-CRITICAL: Handle network errors on savePassword
    // Handle error as needed
    // setErrorMessage?
  }
}

export const getPasswordParams = (client: CozyClient): PasswordParams => {
  const { uri: instance, normalizedFqdn: fqdn } = getFqdnFromClient(client)

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
