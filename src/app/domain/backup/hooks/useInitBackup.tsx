import { useEffect } from 'react'

import { useClient } from 'cozy-client'

import {
  getLocalBackupConfig,
  setBackupAsDone,
  setLastBackup
} from '/app/domain/backup/services/manageLocalBackupConfig'
import { t } from '/locales/i18n'

import Minilog from 'cozy-minilog'

const log = Minilog('💿 Backup')

export const useInitBackup = (): void => {
  const client = useClient()

  useEffect(() => {
    const checkAndFixIfBackupStuckInRunning = async (): Promise<void> => {
      if (!client) {
        return
      }

      try {
        const backupConfig = await getLocalBackupConfig(client)

        if (backupConfig.currentBackup.status === 'running') {
          log.debug('A running backup has been found at startup.')
          await setBackupAsDone(client)
          await setLastBackup(client, {
            status: 'error',
            backedUpMediaCount:
              backupConfig.currentBackup.totalMediasToBackupCount -
              backupConfig.currentBackup.mediasToBackup.length,
            totalMediasToBackupCount:
              backupConfig.currentBackup.totalMediasToBackupCount,
            deduplicatedMediaCount:
              backupConfig.currentBackup.deduplicatedMediaCount,
            message: t('services.backup.errors.appKilled')
          })
        }
      } catch {
        /* empty */
      }
    }

    void checkAndFixIfBackupStuckInRunning()
  }, [client])
}
