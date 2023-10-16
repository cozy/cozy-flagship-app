import * as manageLocalBackupConfig from '/app/domain/backup/services/manageLocalBackupConfig'
import * as manageAlbums from '/app/domain/backup/services/manageAlbums'
import { LocalBackupConfig } from '/app/domain/backup/models'

import type CozyClient from 'cozy-client'

const CAT_ALBUM_NAME = 'My beautiful cat'

const CAT_ALBUM_LOCAL_ID = 'cat-album-local-id'
const CAT_ALBUM_CREATED_ID = 'cat-album-remote-id'

describe('getOrCreateAlbum', () => {
  test('should get album locally', async () => {
    // Given
    jest
      .spyOn(manageLocalBackupConfig, 'getLocalBackupConfig')
      .mockResolvedValue({
        backupedAlbums: [
          {
            name: CAT_ALBUM_NAME,
            remoteId: CAT_ALBUM_LOCAL_ID
          }
        ]
      } as LocalBackupConfig)

    const createRemoteAlbumMock = jest.spyOn(manageAlbums, 'createRemoteAlbum')
    const saveAlbumsMock = jest.spyOn(manageLocalBackupConfig, 'saveAlbums')

    // When
    const album = await manageAlbums.getOrCreateAlbum(
      {} as CozyClient,
      CAT_ALBUM_NAME
    )

    // Then
    expect(createRemoteAlbumMock).not.toHaveBeenCalled()
    expect(saveAlbumsMock).not.toHaveBeenCalled()
    expect(album.name).toBe(CAT_ALBUM_NAME)
    expect(album.remoteId).toBe(CAT_ALBUM_LOCAL_ID)
  })

  test('should create album and save it locally', async () => {
    // Given
    jest
      .spyOn(manageLocalBackupConfig, 'getLocalBackupConfig')
      .mockResolvedValue({
        backupedAlbums: []
      } as unknown as LocalBackupConfig)

    const createRemoteAlbumMock = jest
      .spyOn(manageAlbums, 'createRemoteAlbum')
      .mockResolvedValue({
        name: CAT_ALBUM_NAME,
        remoteId: CAT_ALBUM_CREATED_ID
      })

    const saveAlbumsMock = jest
      .spyOn(manageLocalBackupConfig, 'saveAlbums')
      .mockResolvedValue()

    // When
    const album = await manageAlbums.getOrCreateAlbum(
      {} as CozyClient,
      CAT_ALBUM_NAME
    )

    // Then
    expect(createRemoteAlbumMock).toHaveBeenCalled()
    expect(saveAlbumsMock).toHaveBeenCalled()
    expect(album.name).toBe(CAT_ALBUM_NAME)
    expect(album.remoteId).toBe(CAT_ALBUM_CREATED_ID)
  })
})
