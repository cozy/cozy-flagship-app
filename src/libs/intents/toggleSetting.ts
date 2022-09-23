import Minilog from '@cozy/minilog'

import { getData, StorageKeys, storeData } from '/libs/localStore/storage'

const log = Minilog('toggleSetting.ts')

export const toggleSetting = async (
  settingName: 'biometryLock' | 'PINLock' | 'autoLock'
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
