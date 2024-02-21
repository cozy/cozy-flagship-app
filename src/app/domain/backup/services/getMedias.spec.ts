import { PhotoIdentifier } from '@react-native-camera-roll/camera-roll'
import { Platform } from 'react-native'
import RNFS from 'react-native-fs'

import CozyClient, { createMockClient } from 'cozy-client'

import { Media } from '/app/domain/backup/models'
import * as getMedias from '/app/domain/backup/services/getMedias'

const client = createMockClient() as CozyClient

describe('getRemotePath', () => {
  test('return / on iOS', () => {
    // Given
    const path = 'file:///storage/emulated/0/Pictures/IMG_20230713_103203.jpg'
    Platform.OS = 'ios'
    // @ts-expect-error We want to modify this read only property for test purpose
    RNFS.ExternalStorageDirectoryPath = '/storage/emulated/0'

    // When
    const remotePath = getMedias.getRemotePath(path)

    // Then
    expect(remotePath).toBe('/')
  })

  test('return remote path on Android', () => {
    // Given
    const path = 'file:///storage/emulated/0/Pictures/IMG_20230713_103203.jpg'
    Platform.OS = 'android'
    // @ts-expect-error We want to modify this read only property for test purpose
    RNFS.ExternalStorageDirectoryPath = '/storage/emulated/0'

    // When
    const remotePath = getMedias.getRemotePath(path)

    // Then
    expect(remotePath).toBe('/Pictures')
  })
})

describe('getAllMedias', () => {
  test('return empty medias if nothing on cameraroll', async () => {
    // Given
    jest.spyOn(getMedias, 'getPhotoIdentifiersPage').mockResolvedValue({
      edges: [],
      page_info: {
        has_next_page: false
      }
    })

    // When
    const allMedias = await getMedias.getAllMedias(client)

    // Then
    expect(allMedias).toEqual([])
  })

  test('return correct medias if one page of assets on cameraroll', async () => {
    // Given
    Platform.OS = 'ios'
    jest.spyOn(getMedias, 'getPhotoIdentifiersPage').mockResolvedValue({
      edges: [IOS_PHOTO_IDENTIFIER],
      page_info: {
        has_next_page: false
      }
    })

    // When
    const allMedias = await getMedias.getAllMedias(client)

    // Then
    expect(allMedias).toEqual(IOS_MEDIAS)
  })

  test('return correct medias if two page assets on cameraroll', async () => {
    // Given
    Platform.OS = 'ios'
    jest
      .spyOn(getMedias, 'getPhotoIdentifiersPage')
      .mockResolvedValueOnce({
        edges: [IOS_PHOTO_IDENTIFIER],
        page_info: {
          has_next_page: true
        }
      })
      .mockResolvedValueOnce({
        edges: [IOS_LIVE_PHOTO_IDENTIFIER],
        page_info: {
          has_next_page: false
        }
      })

    // When
    const allMedias = await getMedias.getAllMedias(client)

    // Then
    expect(allMedias).toEqual([...IOS_MEDIAS, ...IOS_LIVE_PHOTO_MEDIAS])
  })

  test('return correct medias if cloud shared alone', async () => {
    // Given
    Platform.OS = 'ios'
    jest.spyOn(getMedias, 'getPhotoIdentifiersPage').mockResolvedValue({
      edges: [IOS_CLOUD_SHARED_PHOTO_IDENTIFIER],
      page_info: {
        has_next_page: false
      }
    })

    // When
    const allMedias = await getMedias.getAllMedias(client)

    // Then
    expect(allMedias).toEqual(IOS_CLOUD_SHARED_MEDIAS)
  })

  test('return correct medias if cloud shared duplicate', async () => {
    // Given
    Platform.OS = 'ios'
    jest.spyOn(getMedias, 'getPhotoIdentifiersPage').mockResolvedValue({
      edges: [IOS_PHOTO_IDENTIFIER, IOS_CLOUD_SHARED_PHOTO_IDENTIFIER],
      page_info: {
        has_next_page: false
      }
    })

    // When
    const allMedias = await getMedias.getAllMedias(client)

    // Then
    expect(allMedias).toEqual(IOS_MERGED_MEDIAS)
  })
})

describe('getAlbums', () => {
  test('return array when group_name is an array', () => {
    // Given
    const photoIdentifier = {
      node: {
        group_name: ['Holiday', '2023']
      }
    } as PhotoIdentifier

    // When
    const albums = getMedias.getAlbums(photoIdentifier)

    // Then
    expect(albums).toEqual([
      {
        name: 'Holiday'
      },
      {
        name: '2023'
      }
    ])
  })

  test('return empty array when group_name is null', () => {
    // Given
    const photoIdentifier = {
      node: {
        group_name: null
      }
    } as unknown as PhotoIdentifier // we already got null group_name in production even if react-native-camera-roll does not consider it

    // When
    const albums = getMedias.getAlbums(photoIdentifier)

    // Then
    expect(albums).toEqual([])
  })
})

describe('mergeUserLibraryAndCloudSharedMedias', () => {
  test('return empty medias if nothing on cameraroll', () => {
    // Given
    const userLibraryMedias: Media[] = [...ANDROID_MEDIAS]
    const cloudSharedMedias: Media[] = [...IOS_CLOUD_SHARED_MEDIAS]

    // When
    const allMedias = getMedias.mergeUserLibraryAndCloudSharedMedias(
      userLibraryMedias,
      cloudSharedMedias
    )

    // Then
    expect(allMedias).toEqual([...ANDROID_MEDIAS, ...IOS_CLOUD_SHARED_MEDIAS])
  })

  test('return empty medias if nothing on cameraroll', () => {
    // Given
    const userLibraryMedias: Media[] = [
      ...ANDROID_MEDIAS,
      ...(JSON.parse(JSON.stringify(IOS_MEDIAS)) as Media[])
    ]
    const cloudSharedMedias: Media[] = [...IOS_CLOUD_SHARED_MEDIAS]

    // When
    const allMedias = getMedias.mergeUserLibraryAndCloudSharedMedias(
      userLibraryMedias,
      cloudSharedMedias
    )

    // Then
    expect(allMedias).toEqual([...ANDROID_MEDIAS, ...IOS_MERGED_MEDIAS])
  })
})

describe('formatMediasFromPhotoIdentifier', () => {
  test('format Android image', () => {
    // Given
    Platform.OS = 'android'
    const photoIdentifier = ANDROID_PHOTO_IDENTIFIER

    // When
    const media = getMedias.formatMediasFromPhotoIdentifier(photoIdentifier)

    // Then
    expect(media).toEqual(ANDROID_MEDIAS)
  })

  test('format iOS image', () => {
    // Given
    Platform.OS = 'ios'
    const photoIdentifier = IOS_PHOTO_IDENTIFIER

    // When
    const media = getMedias.formatMediasFromPhotoIdentifier(photoIdentifier)

    // Then
    expect(media).toEqual(IOS_MEDIAS)
  })

  test('format iOS Live Photo', () => {
    // Given
    Platform.OS = 'ios'
    const photoIdentifier = IOS_LIVE_PHOTO_IDENTIFIER

    // When
    const media = getMedias.formatMediasFromPhotoIdentifier(photoIdentifier)

    // Then
    expect(media).toEqual(IOS_LIVE_PHOTO_MEDIAS)
  })
})

const ANDROID_PHOTO_IDENTIFIER = {
  node: {
    id: '1234',
    group_name: ['Pictures'],
    image: {
      extension: 'jpg',
      fileSize: 1234,
      filename: 'IMG_20230519_204453.jpg',
      height: null,
      orientation: null,
      playableDuration: null,
      uri: 'file:///storage/emulated/0/Pictures/IMG_20230519_204453.jpg',
      width: null
    },
    location: null,
    modificationTimestamp: 1684521894,
    subTypes: [],
    sourceType: 'UserLibrary',
    timestamp: 1684521894.234,
    type: 'image/jpeg'
  }
} as unknown as PhotoIdentifier

const ANDROID_MEDIAS = [
  {
    id: '1234',
    name: 'IMG_20230519_204453.jpg',
    uri: 'file:///storage/emulated/0/Pictures/IMG_20230519_204453.jpg',
    path: 'file:///storage/emulated/0/Pictures/IMG_20230519_204453.jpg',
    remotePath: '/Pictures',
    type: 'image',
    sourceType: 'UserLibrary',
    mimeType: 'image/jpeg',
    fileSize: 1234,
    creationDate: 1684521894000,
    modificationDate: 1684521894000,
    albums: [{ name: 'Pictures' }]
  }
] as Media[]

const IOS_PHOTO_IDENTIFIER = {
  node: {
    group_name: ['Pictures'],
    image: {
      extension: 'heic',
      fileSize: 1234,
      filename: 'IMG_0744.HEIC',
      height: null,
      playableDuration: null,
      uri: 'ph://5FD84686-207F-40F1-BCE8-3A837275B0E3/L0/001',
      width: null
    },
    location: null,
    modificationTimestamp: 1688756699.463186,
    subTypes: [],
    sourceType: 'UserLibrary',
    timestamp: 1682604478.599,
    type: 'image'
  }
} as unknown as PhotoIdentifier

const IOS_MEDIAS = [
  {
    name: 'IMG_0744.HEIC',
    uri: 'ph://5FD84686-207F-40F1-BCE8-3A837275B0E3/L0/001',
    path: 'ph://5FD84686-207F-40F1-BCE8-3A837275B0E3/L0/001',
    remotePath: '/',
    type: 'image',
    sourceType: 'UserLibrary',
    fileSize: 1234,
    mimeType: undefined,
    creationDate: 1682604478000,
    modificationDate: 1688756699000,
    albums: [{ name: 'Pictures' }]
  }
] as Media[]

const IOS_LIVE_PHOTO_IDENTIFIER = {
  node: {
    group_name: ['Pictures'],
    image: {
      extension: 'heic',
      fileSize: 1234,
      filename: 'IMG_0744.HEIC',
      height: null,
      playableDuration: null,
      uri: 'ph://5FD84686-207F-40F1-BCE8-3A837275B0E3/L0/001',
      width: null
    },
    location: null,
    modificationTimestamp: 1688756699.463186,
    subTypes: ['PhotoLive'],
    sourceType: 'UserLibrary',
    timestamp: 1682604478.599,
    type: 'image'
  }
} as unknown as PhotoIdentifier

const IOS_LIVE_PHOTO_MEDIAS = [
  {
    name: 'IMG_0744.MOV',
    uri: 'ph://5FD84686-207F-40F1-BCE8-3A837275B0E3/L0/001',
    path: 'ph://5FD84686-207F-40F1-BCE8-3A837275B0E3/L0/001',
    remotePath: '/',
    type: 'video',
    sourceType: 'UserLibrary',
    subType: 'PhotoLive',
    mimeType: undefined,
    creationDate: 1682604478000,
    modificationDate: 1688756699000,
    albums: [{ name: 'Pictures' }],
    fileSize: null
  },
  {
    name: 'IMG_0744.HEIC',
    uri: 'ph://5FD84686-207F-40F1-BCE8-3A837275B0E3/L0/001',
    path: 'ph://5FD84686-207F-40F1-BCE8-3A837275B0E3/L0/001',
    remotePath: '/',
    type: 'image',
    sourceType: 'UserLibrary',
    subType: 'PhotoLive',
    mimeType: undefined,
    fileSize: 1234,
    creationDate: 1682604478000,
    modificationDate: 1688756699000,
    albums: [{ name: 'Pictures' }]
  }
] as Media[]

const IOS_CLOUD_SHARED_PHOTO_IDENTIFIER = {
  node: {
    group_name: ['My shared album'],
    image: {
      extension: 'heic',
      fileSize: 1234,
      filename: 'IMG_0744.HEIC',
      height: null,
      playableDuration: null,
      uri: 'ph://5FD84686-207F-40F1-BCE8-3A837275B0E3/L0/001',
      width: null
    },
    location: null,
    modificationTimestamp: 1688756699.463186,
    subTypes: [],
    sourceType: 'CloudShared',
    timestamp: 1682604478.599,
    type: 'image'
  }
} as unknown as PhotoIdentifier

const IOS_CLOUD_SHARED_MEDIAS = [
  {
    name: 'IMG_0744.HEIC',
    uri: 'ph://5FD84686-207F-40F1-BCE8-3A837275B0E3/L0/001',
    path: 'ph://5FD84686-207F-40F1-BCE8-3A837275B0E3/L0/001',
    remotePath: '/',
    type: 'image',
    sourceType: 'CloudShared',
    fileSize: 1234,
    mimeType: undefined,
    creationDate: 1682604478000,
    modificationDate: 1688756699000,
    albums: [{ name: 'My shared album' }]
  }
] as Media[]

const IOS_MERGED_MEDIAS = [
  {
    name: 'IMG_0744.HEIC',
    uri: 'ph://5FD84686-207F-40F1-BCE8-3A837275B0E3/L0/001',
    path: 'ph://5FD84686-207F-40F1-BCE8-3A837275B0E3/L0/001',
    remotePath: '/',
    type: 'image',
    sourceType: 'UserLibrary',
    fileSize: 1234,
    mimeType: undefined,
    creationDate: 1682604478000,
    modificationDate: 1688756699000,
    albums: [{ name: 'Pictures' }, { name: 'My shared album' }]
  }
] as Media[]
