import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import { Platform } from 'react-native'

import { Album, BackupedAlbum, Media } from '/app/domain/backup/models'
import {
  getLocalBackupConfig,
  saveAlbums
} from '/app/domain/backup/services/manageLocalBackupConfig'
import { getDeviceId } from '/app/domain/backup/services/manageRemoteBackupConfig'
import {
  buildAlbumsQuery,
  AlbumDocument,
  AlbumsQueryAllResult,
  File
} from '/app/domain/backup/queries'

import type CozyClient from 'cozy-client'
import type { IOCozyFile } from 'cozy-client'
import flag from 'cozy-flags'
import Minilog from 'cozy-minilog'

const DOCTYPE_FILES = 'io.cozy.files'
const DOCTYPE_ALBUMS = 'io.cozy.photos.albums'

const log = Minilog('💿 Backup')

export const areAlbumsEnabled = (): boolean => {
  return Platform.OS === 'ios'
}

export const getAlbums = async (): Promise<Album[]> => {
  const shouldIncludeSharedAlbums = !!flag(
    'flagship.backup.includeSharedAlbums'
  )

  const cameraRollAlbums = await CameraRoll.getAlbums()
  const albums = cameraRollAlbums
    .filter(cameraRollAlbum => {
      if (
        !shouldIncludeSharedAlbums &&
        cameraRollAlbum.subtype === 'AlbumCloudShared'
      ) {
        return false
      }

      return true
    })
    .map(cameraRollAlbum => ({
      name: cameraRollAlbum.title
    }))

  return albums
}

export const createRemoteAlbum = async (
  client: CozyClient,
  albumName: string
): Promise<BackupedAlbum> => {
  const deviceId = await getDeviceId()

  log.debug('Creating album ', albumName)

  const createdAlbum = (await client.save({
    _type: 'io.cozy.photos.albums',
    name: albumName,
    created_at: new Date().toISOString(),
    backupDeviceIds: [deviceId]
  })) as { data: { name: string; id: string } }

  return {
    name: createdAlbum.data.name,
    remoteId: createdAlbum.data.id
  }
}

const formatBackupedAlbum = (album: AlbumDocument): BackupedAlbum => {
  return {
    name: album.name,
    remoteId: album.id
  }
}

export const fetchBackupedAlbums = async (
  client: CozyClient
): Promise<BackupedAlbum[]> => {
  const albumsQuery = buildAlbumsQuery()

  const data = (await client.queryAll(albumsQuery)) as AlbumsQueryAllResult

  const backupedAlbums = data.map(album => formatBackupedAlbum(album))

  return backupedAlbums
}

export const addMediaToAlbums = async (
  client: CozyClient,
  mediaToUpload: Media,
  documentCreated: IOCozyFile | File
): Promise<void> => {
  for (const album of mediaToUpload.albums) {
    const { remoteId: albumId } = await getOrCreateAlbum(client, album.name)

    await addMediaToAlbum(client, albumId, documentCreated.id!)
  }
}

const addMediaToAlbum = async (
  client: CozyClient,
  albumId: string,
  documentId: string
): Promise<void> => {
  await client.collection(DOCTYPE_FILES).addReferencesTo(
    {
      _id: albumId,
      _type: DOCTYPE_ALBUMS
    },
    [
      {
        _id: documentId
      }
    ]
  )
}

export const getOrCreateAlbum = async (
  client: CozyClient,
  albumName: string
): Promise<BackupedAlbum> => {
  const localBackupConfig = await getLocalBackupConfig(client)

  const localAlbum = localBackupConfig.backupedAlbums.find(
    backupedAlbum => backupedAlbum.name === albumName
  )

  if (localAlbum) {
    return localAlbum
  }

  const newlyCreatedAlbum = await createRemoteAlbum(client, albumName)

  await saveAlbums(client, [newlyCreatedAlbum])

  return newlyCreatedAlbum
}
