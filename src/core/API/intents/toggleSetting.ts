import Minilog from '@cozy/minilog'

import { removeVaultInformation, saveVaultInformation } from '/libs/keychain'
import {
  openSettingBiometry,
  BiometryEmitter
} from '/libs/intents/setBiometryState'
import { getData, StorageKeys, storeData } from '/libs/localStore/storage'

const log = Minilog('toggleSetting.ts')

const toggleStorageSetting = async (
  settingName?: 'autoLock'
): Promise<boolean | null> => {
  try {
    if (settingName === 'autoLock') {
      const enabled = await getData(StorageKeys.AutoLockEnabled)
      const dataToStore = !enabled
      await storeData(StorageKeys.AutoLockEnabled, dataToStore)
      return Boolean(await getData(StorageKeys.AutoLockEnabled))
    }
  } catch (error) {
    log.error(error)
  }

  return null
}

export const ensureAutoLockIsEnabled = async (): Promise<void> => {
  const autoLockEnabled = await getData(StorageKeys.AutoLockEnabled)

  if (!autoLockEnabled) {
    await storeData(StorageKeys.AutoLockEnabled, true)
  }
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
