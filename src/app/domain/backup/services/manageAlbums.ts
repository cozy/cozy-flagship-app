import { CameraRoll } from '@react-native-camera-roll/camera-roll'

import { Album, BackupedAlbum } from '/app/domain/backup/models'
import { getLocalBackupConfig } from '/app/domain/backup/services/manageLocalBackupConfig'

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

  const createdAlbums = []

  for (const albumToCreate of albumsToCreate) {
    const createdAlbum = (await client.save({
      _type: 'io.cozy.photos.albums',
      name: albumToCreate.name,
      created_at: new Date().toISOString()
    })) as { data: { name: string; id: string } }

    createdAlbums.push({
      name: createdAlbum.data.name,
      remoteId: createdAlbum.data.id
    })
  }

  return createdAlbums
}
