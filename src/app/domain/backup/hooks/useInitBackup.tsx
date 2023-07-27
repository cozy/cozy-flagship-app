import { useEffect } from 'react'

import { useClient } from 'cozy-client'

import {
  getLocalBackupConfig,
  setBackupAsToDo
} from '/app/domain/backup/services/manageLocalBackupConfig'

import Minilog from 'cozy-minilog'

const log = Minilog('💿 Backup')

export const useInitBackup = (): void => {
  const client = useClient()

  useEffect(() => {
    const checkAndFixIfBackupStuckInRunning = async (): Promise<void> => {
      if (!client) {
        return
      }

      const backupConfig = await getLocalBackupConfig(client)

      if (backupConfig.currentBackup.status === 'running') {
        log.debug('A running backup has been set as to do.')
        await setBackupAsToDo(client)
      }
    }

    void checkAndFixIfBackupStuckInRunning()
  }, [client])
}
