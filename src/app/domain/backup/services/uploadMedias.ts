/* eslint-disable promise/always-return */

import { AppState, Platform } from 'react-native'

import { uploadMedia } from '/app/domain/backup/services/uploadMedia'
import { setMediaAsBackuped } from '/app/domain/backup/services/manageLocalBackupConfig'
import { getDeviceId } from '/app/domain/backup/services/manageRemoteBackupConfig'
import {
  Media,
  UploadMetadata,
  LocalBackupConfig,
  ProgressCallback
} from '/app/domain/backup/models'
import { getBackupInfo } from '/app/domain/backup/services/manageBackup'
import {
  BackupError,
  isUploadError,
  isQuotaExceededError,
  isFileTooBigError,
  isCancellationError
} from '/app/domain/backup/helpers/error'
import {
  areAlbumsEnabled,
  addMediaToAlbums
} from '/app/domain/backup/services/manageAlbums'
import { t } from '/locales/i18n'

import type CozyClient from 'cozy-client'
import type { IOCozyFile } from 'cozy-client'
import Minilog from 'cozy-minilog'

import { NetworkError } from '/app/domain/upload/models'

const log = Minilog('💿 Backup')

const DOCTYPE_FILES = 'io.cozy.files'

let shouldStopBackup = false

export const getShouldStopBackup = (): boolean => {
  return shouldStopBackup
}

export const setShouldStopBackup = (value: boolean): void => {
  shouldStopBackup = value
}

const shouldStopBecauseBackground = (): boolean => {
  if (Platform.OS === 'android' && Platform.Version < 31) {
    return false
  }

  return AppState.currentState === 'background'
}

export const uploadMedias = async (
  client: CozyClient,
  localBackupConfig: LocalBackupConfig,
  onProgress: ProgressCallback
): Promise<string | undefined> => {
  const {
    currentBackup: { mediasToBackup: mediasToUpload }
  } = localBackupConfig

  let lastUploadedDocument

  let firstPartialSuccessMessage: string | undefined

  for (const mediaToUpload of mediasToUpload) {
    if (shouldStopBackup) {
      shouldStopBackup = false
      return t('services.backup.errors.backupStopped')
    }

    if (shouldStopBecauseBackground()) {
      return t('services.backup.errors.appKilled')
    }

    try {
      lastUploadedDocument = await prepareAndUploadMedia(
        client,
        localBackupConfig,
        mediaToUpload,
        lastUploadedDocument
      )
    } catch (error) {
      log.warn(
        `❌ ${
          mediaToUpload.name
        } not uploaded or set as backuped correctly (${JSON.stringify(error)})`
      )

      if (error instanceof NetworkError) {
        throw new BackupError(t('services.backup.errors.networkIssue'))
      }

      if (isUploadError(error)) {
        if (isQuotaExceededError(error)) {
          throw new BackupError(
            t('services.backup.errors.quotaExceeded'),
            error.statusCode
          )
        } else if (isFileTooBigError(error)) {
          firstPartialSuccessMessage =
            firstPartialSuccessMessage ?? t('services.backup.errors.fileTooBig')
        } else if (isCancellationError(error)) {
          shouldStopBackup = false
          return t('services.backup.errors.backupStopped')
        } else {
          firstPartialSuccessMessage =
            firstPartialSuccessMessage ??
            t('services.backup.errors.unknownIssue')
        }
      } else {
        throw new BackupError(t('services.backup.errors.unknownIssue'))
      }
    }

    void onProgress(await getBackupInfo(client))
  }

  return firstPartialSuccessMessage
}

const prepareAndUploadMedia = async (
  client: CozyClient,
  localBackupConfig: LocalBackupConfig,
  mediaToUpload: Media,
  lastUploadedDocument: IOCozyFile | undefined
): Promise<IOCozyFile> => {
  const uploadFolderId = await getUploadFolderId(
    client,
    localBackupConfig,
    mediaToUpload
  )

  const uploadMetadata = await generateMetadataObject(
    mediaToUpload,
    lastUploadedDocument
  )

  const uploadUrl = getUploadUrl(
    client,
    uploadFolderId,
    uploadMetadata,
    mediaToUpload
  )
  const { data: documentCreated } = await uploadMedia(
    client,
    uploadUrl,
    mediaToUpload
  )

  log.debug(`✅ ${mediaToUpload.name} uploaded`)

  await postUpload(client, mediaToUpload, documentCreated)

  await setMediaAsBackuped(client, mediaToUpload, documentCreated)

  log.debug(`✅ ${mediaToUpload.name} set as backuped`)

  return documentCreated
}

const postUpload = async (
  client: CozyClient,
  mediaToUpload: Media,
  documentCreated: IOCozyFile
): Promise<void> => {
  if (mediaToUpload.albums.length > 0 && areAlbumsEnabled()) {
    await addMediaToAlbums(client, mediaToUpload, documentCreated)
  }
}

const generateMetadataObject = async (
  media: Media,
  lastUploadedDocument?: IOCozyFile
): Promise<UploadMetadata> => {
  const deviceId = await getDeviceId()

  const metadataObject: UploadMetadata = {
    backupDeviceIds: [deviceId],
    idFromLibrary: media.id,
    creationDateFromLibrary: new Date(media.creationDate).toISOString()
  }

  if (
    media.type === 'image' &&
    media.subType === 'PhotoLive' &&
    lastUploadedDocument
  ) {
    metadataObject.pairedVideoId = lastUploadedDocument.id
  }

  return metadataObject
}

const getUploadFolderId = async (
  client: CozyClient,
  localBackupConfig: LocalBackupConfig,
  mediaToUpload: Media
): Promise<string> => {
  const {
    remoteBackupConfig: { backupFolder }
  } = localBackupConfig

  if (mediaToUpload.remotePath === '/') {
    return backupFolder.id
  } else {
    const path = backupFolder.path + mediaToUpload.remotePath

    const dirId = await client
      .collection(DOCTYPE_FILES)
      .ensureDirectoryExists(path)

    return dirId
  }
}

const getUploadUrl = (
  client: CozyClient,
  backupFolderId: string,
  uploadMetadata: UploadMetadata,
  media: Media
): string => {
  const createdAt = new Date(media.creationDate).toISOString()
  const modifiedAt = new Date(media.modificationDate).toISOString()

  const toURL = new URL(client.getStackClient().uri)
  toURL.pathname = `/files/${backupFolderId}`
  toURL.searchParams.append('Name', media.name)
  toURL.searchParams.append('Type', 'file')
  toURL.searchParams.append('Tags', 'library')
  toURL.searchParams.append('Executable', 'false')
  toURL.searchParams.append('CreatedAt', createdAt)
  toURL.searchParams.append('UpdatedAt', modifiedAt)
  toURL.searchParams.append('Metadata', JSON.stringify(uploadMetadata))
  if (media.fileSize !== null) {
    toURL.searchParams.append('Size', media.fileSize.toString())
  }

  return toURL.toString()
}
