/* eslint-disable promise/always-return */

import { uploadMedia } from '/app/domain/backup/services/uploadMedia'
import {
  setMediaAsBackupedBecauseUploaded,
  setMediaAsBackupedBecauseDeduplicated
} from '/app/domain/backup/services/manageLocalBackupConfig'
import {
  getDeviceId,
  getCorrespondingRemoteFile
} from '/app/domain/backup/services/manageRemoteBackupConfig'
import {
  Media,
  UploadMetadata,
  LocalBackupConfig,
  ProgressCallback
} from '/app/domain/backup/models'
import { getBackupInfo } from '/app/domain/backup/services/manageBackup'
import {
  BackupError,
  isNetworkError,
  isUploadError,
  isQuotaExceededError,
  isFileTooBigError,
  isCancellationError
} from '/app/domain/backup/helpers/error'
import {
  areAlbumsEnabled,
  addMediaToAlbums
} from '/app/domain/backup/services/manageAlbums'
import {
  getShouldStopBackup,
  setShouldStopBackup,
  shouldStopBecauseBackground
} from '/app/domain/backup/services/stopBackup'
import { File } from '/app/domain/backup/queries'
import { t } from '/locales/i18n'

import type CozyClient from 'cozy-client'
import type { IOCozyFile } from 'cozy-client'
import flag from 'cozy-flags'
import Minilog from 'cozy-minilog'

import { CancellationError } from '/app/domain/upload/models'
const log = Minilog('💿 Backup')

const DOCTYPE_FILES = 'io.cozy.files'

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
    if (getShouldStopBackup()) {
      setShouldStopBackup(false)
      log.debug('Backup stopped because asked by the user')
      return t('services.backup.errors.backupStopped')
    }

    if (shouldStopBecauseBackground()) {
      log.debug('Backup stopped because in background')
      return t('services.backup.errors.appKilled')
    }

    if (flag('flagship.backup.dedup')) {
      const correspondingRemoteFile = getCorrespondingRemoteFile(mediaToUpload)

      if (correspondingRemoteFile) {
        await executePostBackupTasks(
          client,
          mediaToUpload,
          correspondingRemoteFile
        )

        await setMediaAsBackupedBecauseDeduplicated(
          client,
          mediaToUpload,
          correspondingRemoteFile
        )

        void onProgress(await getBackupInfo(client))

        continue
      }
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
        `❌ ${mediaToUpload.name} (${JSON.stringify(
          mediaToUpload
        )}) not uploaded or set as backuped correctly (${
          error as string
        } - ${JSON.stringify(error)})`
      )

      if (isNetworkError(error)) {
        throw new BackupError(t('services.backup.errors.networkIssue'))
      }

      if (isCancellationError(error)) {
        setShouldStopBackup(false)
        return t('services.backup.errors.backupStopped')
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
        } else {
          firstPartialSuccessMessage =
            firstPartialSuccessMessage ??
            t('services.backup.errors.unknownIssue')
        }
      } else {
        firstPartialSuccessMessage =
          firstPartialSuccessMessage ?? t('services.backup.errors.unknownIssue')
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

  if (getShouldStopBackup()) {
    throw new CancellationError()
  }

  const { data: documentCreated } = await uploadMedia(
    client,
    uploadUrl,
    mediaToUpload
  )

  log.debug(`✅ ${mediaToUpload.name} uploaded`)

  await executePostBackupTasks(client, mediaToUpload, documentCreated)

  await setMediaAsBackupedBecauseUploaded(
    client,
    mediaToUpload,
    documentCreated
  )

  return documentCreated
}

const executePostBackupTasks = async (
  client: CozyClient,
  mediaToUpload: Media,
  documentCreated: IOCozyFile | File
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
