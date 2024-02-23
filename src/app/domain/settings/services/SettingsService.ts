import Minilog from 'cozy-minilog'

import {
  openSettingBiometry,
  BiometryEmitter
} from '/app/domain/authentication/services/BiometryService'
import { removeVaultInformation, saveVaultInformation } from '/libs/keychain'
import {
  getData,
  CozyPersistedStorageKeys,
  storeData
} from '/libs/localStore/storage'

const log = Minilog('toggleSetting.ts')

const toggleStorageSetting = async (
  settingName?: 'autoLock'
): Promise<boolean | null> => {
  try {
    if (settingName === 'autoLock') {
      const enabled = await getData(CozyPersistedStorageKeys.AutoLockEnabled)
      const dataToStore = !enabled
      await storeData(CozyPersistedStorageKeys.AutoLockEnabled, dataToStore)
      return Boolean(await getData(CozyPersistedStorageKeys.AutoLockEnabled))
    }
  } catch (error) {
    log.error(error)
  }

  return null
}

export const ensureAutoLockIsEnabled = async (): Promise<boolean> => {
  const autoLockEnabled = await getData(
    CozyPersistedStorageKeys.AutoLockEnabled
  )

  if (!autoLockEnabled) {
    await storeData(CozyPersistedStorageKeys.AutoLockEnabled, true)
  }

  const autoLockValue = Boolean(
    await getData(CozyPersistedStorageKeys.AutoLockEnabled)
  )

  return autoLockValue
}

export const toggleSetting = async (
  settingName: 'biometryLock' | 'autoLock' | 'PINLock',
  params?: { pinCode?: string }
): Promise<boolean | null> => {
  let resolveTo = null

  if (settingName === 'biometryLock') resolveTo = await openSettingBiometry()

  if (settingName === 'autoLock')
    resolveTo = await toggleStorageSetting('autoLock')

  if (settingName === 'PINLock' && !params?.pinCode) {
    await removeVaultInformation('pinCode')
    resolveTo = false
  }

  if (params?.pinCode && typeof params.pinCode === 'string') {
    await saveVaultInformation('pinCode', params.pinCode)
    await ensureAutoLockIsEnabled()
    resolveTo = true
  }

  BiometryEmitter.emit('change', resolveTo)

  return Promise.resolve(resolveTo)
}
