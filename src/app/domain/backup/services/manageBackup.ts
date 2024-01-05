import type CozyClient from 'cozy-client'
import flag from 'cozy-flags'
import Minilog from 'cozy-minilog'

import {
  getLocalBackupConfig,
  initializeLocalBackupConfig,
  setBackupAsInitializing,
  setBackupAsReady,
  setBackupAsRunning,
  setBackupAsDone,
  setLastBackup,
  fixLocalBackupConfigIfNecessary
} from '/app/domain/backup/services/manageLocalBackupConfig'
import { prepareDeduplication } from '/app/domain/backup/services/manageRemoteBackupConfig'
import { getMediasToBackup } from '/app/domain/backup/services/getMedias'
import {
  uploadMedias,
  setShouldStopBackup
} from '/app/domain/backup/services/uploadMedias'
import {
  cancelUpload,
  getCurrentUploadId
} from '/app/domain/upload/services/upload'
import {
  activateKeepAwake,
  deactivateKeepAwake
} from '/app/domain/sleep/services/sleep'
import {
  BackupInfo,
  ProgressCallback,
  LocalBackupConfig,
  LastBackup
} from '/app/domain/backup/models'
import { showLocalNotification } from '/libs/notifications/notifications'
import { BackupError } from '/app/domain/backup/helpers'
import { t } from '/locales/i18n'

const log = Minilog('💿 Backup')

export {
  checkBackupPermissions,
  requestBackupPermissions
} from '/app/domain/backup/services/managePermissions'

export const prepareBackup = async (
  client: CozyClient,
  onProgress: ProgressCallback
): Promise<BackupInfo> => {
  log.debug('Backup preparation started')

  try {
    const backupConfig = await initializeBackup(client)

    if (backupConfig.currentBackup.status === 'running') {
      return await getBackupInfo(client)
    }

    await setBackupAsInitializing(client)

    void onProgress(await getBackupInfo(client))

    if (flag('flagship.backup.dedup')) {
      await prepareDeduplication(client)
    }

    const mediasToBackup = await getMediasToBackup(client, onProgress)

    await setBackupAsReady(client, mediasToBackup)

    void onProgress(await getBackupInfo(client))

    log.debug('Backup preparation done')
  } catch (e) {
    log.debug('Backup preparation failed')

    log.warn(e)

    throw e
  }

  return await getBackupInfo(client)
}

export const startBackup = async (
  client: CozyClient,
  onProgress: ProgressCallback
): Promise<BackupInfo> => {
  log.debug('Backup started')

  const localBackupConfig = await getLocalBackupConfig(client)

  await setBackupAsRunning(client)

  void onProgress(await getBackupInfo(client))

  activateKeepAwake('backup')

  try {
    const partialSuccessMessage = await uploadMedias(
      client,
      localBackupConfig,
      onProgress
    )

    const postUploadLocalBackupConfig = await getLocalBackupConfig(client)

    let status: LastBackup['status'] = 'success'
    let titleKey = 'services.backup.notifications.backupSuccessTitle'
    let bodyKey = 'services.backup.notifications.backupSuccessBody'
    let message

    if (partialSuccessMessage) {
      status = 'partial_success'
      titleKey = 'services.backup.notifications.backupPartialSuccessTitle'
      bodyKey = 'services.backup.notifications.backupPartialSuccessBody'
      message = partialSuccessMessage
    }

    await setLastBackup(client, {
      status,
      backedUpMediaCount:
        postUploadLocalBackupConfig.currentBackup.totalMediasToBackupCount -
        postUploadLocalBackupConfig.currentBackup.mediasToBackup.length,
      totalMediasToBackupCount:
        postUploadLocalBackupConfig.currentBackup.totalMediasToBackupCount,
      deduplicatedMediaCount:
        postUploadLocalBackupConfig.currentBackup.deduplicatedMediaCount,
      message
    })

    await showLocalNotification({
      title: t(titleKey),
      body: t(bodyKey, {
        backedUpMediaCount:
          postUploadLocalBackupConfig.currentBackup.totalMediasToBackupCount -
          postUploadLocalBackupConfig.currentBackup.mediasToBackup.length,
        totalMediasToBackupCount:
          postUploadLocalBackupConfig.currentBackup.totalMediasToBackupCount
      }),
      data: {
        redirectLink: 'photos/#/backup'
      }
    })
  } catch (e) {
    const postUploadLocalBackupConfig = await getLocalBackupConfig(client)
    if (e instanceof BackupError) {
      await setLastBackup(client, {
        status: 'error',
        code: e.statusCode,
        backedUpMediaCount:
          postUploadLocalBackupConfig.currentBackup.totalMediasToBackupCount -
          postUploadLocalBackupConfig.currentBackup.mediasToBackup.length,
        totalMediasToBackupCount:
          postUploadLocalBackupConfig.currentBackup.totalMediasToBackupCount,
        deduplicatedMediaCount:
          postUploadLocalBackupConfig.currentBackup.deduplicatedMediaCount,
        message: e.textMessage
      })
    } else {
      await setLastBackup(client, {
        status: 'error',
        backedUpMediaCount:
          postUploadLocalBackupConfig.currentBackup.totalMediasToBackupCount -
          postUploadLocalBackupConfig.currentBackup.mediasToBackup.length,
        totalMediasToBackupCount:
          postUploadLocalBackupConfig.currentBackup.totalMediasToBackupCount,
        deduplicatedMediaCount:
          postUploadLocalBackupConfig.currentBackup.deduplicatedMediaCount,
        message: t('services.backup.errors.unknownIssue')
      })
    }

    await showLocalNotification({
      title: t('services.backup.notifications.backupErrorTitle'),
      body: t('services.backup.notifications.backupErrorBody'),
      data: {
        redirectLink: 'photos/#/backup'
      }
    })
  }

  deactivateKeepAwake('backup')

  const localBackupConfigAfterUpload = await getLocalBackupConfig(client)

  if (localBackupConfigAfterUpload.currentBackup.status === 'running') {
    await setBackupAsDone(client)

    log.debug('Backup done')
  } else {
    log.debug('Backup stopped')
  }

  void onProgress(await getBackupInfo(client))

  return await getBackupInfo(client)
}

export const stopBackup = async (client: CozyClient): Promise<BackupInfo> => {
  setShouldStopBackup(true)

  const uploadId = getCurrentUploadId()

  if (uploadId) {
    await cancelUpload(uploadId)
  }

  return await getBackupInfo(client)
}

export const getBackupInfo = async (
  client: CozyClient
): Promise<BackupInfo> => {
  const backupConfig = await getLocalBackupConfig(client)

  return {
    remoteBackupConfig: backupConfig.remoteBackupConfig,
    lastBackupDate: backupConfig.lastBackupDate,
    backupedMediasCount: backupConfig.backupedMedias.length,
    currentBackup: {
      status: backupConfig.currentBackup.status,
      mediasToBackupCount: backupConfig.currentBackup.mediasToBackup.length,
      totalMediasToBackupCount:
        backupConfig.currentBackup.totalMediasToBackupCount
    },
    lastBackup: backupConfig.lastBackup
  }
}

const initializeBackup = async (
  client: CozyClient
): Promise<LocalBackupConfig> => {
  let localBackupConfig

  try {
    localBackupConfig = await getLocalBackupConfig(client)
  } catch {
    log.debug('Backup not found')

    const newLocalBackupConfig = await initializeLocalBackupConfig(client)

    return newLocalBackupConfig
  }

  log.debug('Backup found')

  try {
    localBackupConfig = await fixLocalBackupConfigIfNecessary(client)
  } catch (e) {
    log.debug('Error trying to fix local backup config', e)

    if (e instanceof Error) {
      if (
        e.message === 'Remote backup folder has been trashed.' ||
        e.message === 'Remote backup folder has been deleted.'
      ) {
        log.debug(
          'Reseting local backup config because folder has been trashed or deleted'
        )
        return await initializeLocalBackupConfig(client)
      }
    }

    throw e
  }

  return localBackupConfig
}
