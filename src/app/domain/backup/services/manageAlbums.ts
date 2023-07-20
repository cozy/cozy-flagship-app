import { CameraRoll } from '@react-native-camera-roll/camera-roll'

import { Album, BackupedAlbum } from '/app/domain/backup/models'
import { getLocalBackupConfig } from '/app/domain/backup/services/manageLocalBackupConfig'
import { getDeviceId } from '/app/domain/backup/services/manageRemoteBackupConfig'
import {
  buildAlbumsQuery,
  AlbumDocument,
  AlbumsQueryAllResult
} from '/app/domain/backup/queries'

import type CozyClient from 'cozy-client'

export const getAlbums = async (): Promise<Album[]> => {
  const cameraRollAlbums = await CameraRoll.getAlbums()

  const albums = cameraRollAlbums.map(cameraRollAlbum => ({
    name: cameraRollAlbum.title
  }))

  return albums
}

export const createRemoteAlbums = async (
  client: CozyClient,
  albums: Album[]
): Promise<BackupedAlbum[]> => {
  const { backupedAlbums } = await getLocalBackupConfig(client)

  const albumsToCreate = albums.filter(
    album =>
      !backupedAlbums.find(backupedAlbum => backupedAlbum.name === album.name)
  )

  const deviceId = await getDeviceId()

  const createdAlbums = []

  for (const albumToCreate of albumsToCreate) {
    const createdAlbum = (await client.save({
      _type: 'io.cozy.photos.albums',
      name: albumToCreate.name,
      created_at: new Date().toISOString(),
      backupDeviceIds: [deviceId]
    })) as { data: { name: string; id: string } }

    createdAlbums.push({
      name: createdAlbum.data.name,
      remoteId: createdAlbum.data.id
    })
  }

  return createdAlbums
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
  const deviceId = await getDeviceId()

  const albumsQuery = buildAlbumsQuery(deviceId)

  const data = (await client.queryAll(albumsQuery)) as AlbumsQueryAllResult

  const backupedAlbums = data.map(album => formatBackupedAlbum(album))

  return backupedAlbums
}
