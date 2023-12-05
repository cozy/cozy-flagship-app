import { PhotoIdentifier } from '@react-native-camera-roll/camera-roll'
import { Platform } from 'react-native'
import RNFS from 'react-native-fs'

import * as getMedias from '/app/domain/backup/services/getMedias'

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

describe('formatMediasFromPhotoIdentifier', () => {
  test('format Android image', () => {
    // Given
    Platform.OS = 'android'
    const photoIdentifier = {
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
        timestamp: 1684521894.234,
        type: 'image/jpeg'
      }
    } as unknown as PhotoIdentifier

    // When
    const media = getMedias.formatMediasFromPhotoIdentifier(photoIdentifier)

    // Then
    expect(media).toEqual([
      {
        id: '1234',
        name: 'IMG_20230519_204453.jpg',
        uri: 'file:///storage/emulated/0/Pictures/IMG_20230519_204453.jpg',
        path: 'file:///storage/emulated/0/Pictures/IMG_20230519_204453.jpg',
        remotePath: '/Pictures',
        type: 'image',
        mimeType: 'image/jpeg',
        fileSize: 1234,
        creationDate: 1684521894000,
        modificationDate: 1684521894000,
        albums: [{ name: 'Pictures' }]
      }
    ])
  })

  test('format iOS image', () => {
    // Given
    Platform.OS = 'ios'
    const photoIdentifier = {
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
        timestamp: 1682604478.599,
        type: 'image'
      }
    } as unknown as PhotoIdentifier

    // When
    const media = getMedias.formatMediasFromPhotoIdentifier(photoIdentifier)

    // Then
    expect(media).toEqual([
      {
        name: 'IMG_0744.HEIC',
        uri: 'ph://5FD84686-207F-40F1-BCE8-3A837275B0E3/L0/001',
        path: 'ph://5FD84686-207F-40F1-BCE8-3A837275B0E3/L0/001',
        remotePath: '/',
        type: 'image',
        fileSize: 1234,
        mimeType: undefined,
        creationDate: 1682604478000,
        modificationDate: 1688756699000,
        albums: [{ name: 'Pictures' }]
      }
    ])
  })

  test('format iOS Live Photo', () => {
    // Given
    Platform.OS = 'ios'
    const photoIdentifier = {
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
        timestamp: 1682604478.599,
        type: 'image'
      }
    } as unknown as PhotoIdentifier

    // When
    const media = getMedias.formatMediasFromPhotoIdentifier(photoIdentifier)

    // Then
    expect(media).toEqual([
      {
        name: 'IMG_0744.MOV',
        uri: 'ph://5FD84686-207F-40F1-BCE8-3A837275B0E3/L0/001',
        path: 'ph://5FD84686-207F-40F1-BCE8-3A837275B0E3/L0/001',
        remotePath: '/',
        type: 'video',
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
        subType: 'PhotoLive',
        mimeType: undefined,
        fileSize: 1234,
        creationDate: 1682604478000,
        modificationDate: 1688756699000,
        albums: [{ name: 'Pictures' }]
      }
    ])
  })
})
