/* eslint-disable promise/always-return */
import Minilog from 'cozy-minilog'

import { uploadMedia } from '/app/domain/backup/services/uploadMedia'
import {
  setBackupAsDone,
  setMediaAsBackuped
} from '/app/domain/backup/services/manageLocalBackupConfig'
import {
  Media,
  LocalBackupConfig,
  ProgressCallback
} from '/app/domain/backup/models'
import { getBackupInfo } from '/app/domain/backup/services/manageBackup'

import type CozyClient from 'cozy-client'
import { IOCozyFile } from 'cozy-client'

const log = Minilog('💿 Backup')

const DOCTYPE_FILES = 'io.cozy.files'
const DOCTYPE_ALBUMS = 'io.cozy.photos.albums'

let shouldStopBackup = false

export const getShouldStopBackup = (): boolean => {
  return shouldStopBackup
}

export const setShouldStopBackup = (value: boolean): void => {
  shouldStopBackup = value
}

export const uploadMedias = async (
  client: CozyClient,
  localBackupConfig: LocalBackupConfig,
  onProgress: ProgressCallback
): Promise<void> => {
  const {
    remoteBackupConfig: {
      backupFolder: { id: backupFolderId }
    },
    currentBackup: { mediasToBackup: mediasToUpload }
  } = localBackupConfig

  for (const mediaToUpload of mediasToUpload) {
    if (shouldStopBackup) {
      shouldStopBackup = false
      await setBackupAsDone(client)
      return
    }

    try {
      const uploadUrl = getUploadUrl(client, backupFolderId, mediaToUpload)

      const { data: documentCreated } = await uploadMedia(
        client,
        uploadUrl,
        mediaToUpload
      )

      log.debug(`✅ ${mediaToUpload.name} uploaded`)

      await postUpload(
        client,
        localBackupConfig,
        mediaToUpload,
        documentCreated
      )

      await setMediaAsBackuped(client, mediaToUpload)

      log.debug(`✅ ${mediaToUpload.name} set as backuped`)
    } catch (e) {
      log.debug(
        `❌ ${mediaToUpload.name} not uploaded or set as backuped correctly`
      )
      log.debug(e)
    }

    void onProgress(await getBackupInfo(client))
  }

  return
}

const postUpload = async (
  client: CozyClient,
  localBackupConfig: LocalBackupConfig,
  mediaToUpload: Media,
  documentCreated: IOCozyFile
): Promise<void> => {
  if (mediaToUpload.albums.length > 0) {
    await addMediaToAlbum(
      client,
      localBackupConfig,
      mediaToUpload,
      documentCreated
    )
  }
}

const addMediaToAlbum = async (
  client: CozyClient,
  localBackupConfig: LocalBackupConfig,
  mediaToUpload: Media,
  documentCreated: IOCozyFile
): Promise<void> => {
  for (const album of mediaToUpload.albums) {
    const { remoteId } =
      localBackupConfig.backupedAlbums.find(
        backupedAlbum => backupedAlbum.name === album.name
      ) ?? {}

    if (remoteId === undefined) {
      return
    }

    await client.collection(DOCTYPE_FILES).addReferencesTo(
      {
        _id: remoteId,
        _type: DOCTYPE_ALBUMS
      },
      [
        {
          _id: documentCreated.id
        }
      ]
    )
  }
}

const getUploadUrl = (
  client: CozyClient,
  backupFolderId: string,
  media: Media
): string => {
  const createdAt = new Date(media.creationDate).toISOString()

  const toURL =
    client.getStackClient().uri +
    '/files/' +
    backupFolderId +
    '?Name=' +
    encodeURIComponent(media.name) +
    '&Type=file&Tags=library&Executable=false&CreatedAt=' +
    createdAt +
    '&UpdatedAt=' +
    createdAt

  return toURL
}
