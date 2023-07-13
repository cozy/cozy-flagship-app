import {
  CameraRoll,
  PhotoIdentifiersPage,
  PhotoIdentifier
} from '@react-native-camera-roll/camera-roll'
import { Platform } from 'react-native'
import RNFS from 'react-native-fs'

import { Media, BackupedMedia, Album } from '/app/domain/backup/models'
import { getLocalBackupConfig } from '/app/domain/backup/services/manageLocalBackupConfig'

import type CozyClient from 'cozy-client'

const MEDIAS_BY_PAGE = 500

type CameraRollCursor = string | undefined

const getPhotoIdentifiersPage = async (
  after: CameraRollCursor
): Promise<PhotoIdentifiersPage> => {
  const photoIdentifiersPage = await CameraRoll.getPhotos({
    first: MEDIAS_BY_PAGE,
    after: after,
    include: ['filename', 'fileExtension']
  })

  return photoIdentifiersPage
}

export const getRemotePath = (uri: string): string => {
  if (Platform.OS === 'ios') {
    return '/'
  }

  if (Platform.OS === 'android') {
    const uriWithProtocolRemoved = uri.replace('file://', '')
    const uriWithExternalStorageDirectoryPathRemoved =
      uriWithProtocolRemoved.replace(RNFS.ExternalStorageDirectoryPath, '')

    const uriWithFilenameRemoved =
      uriWithExternalStorageDirectoryPathRemoved.substring(
        0,
        uriWithExternalStorageDirectoryPathRemoved.lastIndexOf('/')
      )

    return uriWithFilenameRemoved
  }

  throw new Error('Platform is not supported for backup')
}

const formatMediasFromPhotoIdentifier = (
  photoIdentifier: PhotoIdentifier
): Media[] => {
  const {
    node: {
      image: { filename, uri },
      type,
      subTypes,
      timestamp
    }
  } = photoIdentifier

  if (filename === null) return []

  const albums = getAlbums(photoIdentifier)

  if (subTypes.includes('PhotoLive')) {
    return [
      {
        name: filename.substring(0, filename.lastIndexOf('.')) + '.MOV',
        path: uri,
        remotePath: getRemotePath(uri),
        type: 'video',
        subType: 'PhotoLive',
        creationDate: timestamp * 1000,
        albums
      },
      {
        name: filename,
        path: uri,
        remotePath: getRemotePath(uri),
        type: 'image',
        subType: 'PhotoLive',
        creationDate: timestamp * 1000,
        albums
      }
    ]
  }

  return [
    {
      name: filename,
      path: uri,
      remotePath: getRemotePath(uri),
      type: type.includes('image') ? 'image' : 'video',
      creationDate: timestamp * 1000,
      albums
    }
  ]
}

/*
  This code is linked to a patch-package of @react-native-camera-roll/camera-roll
  returning for each asset its albums.

  With this patch-package, group_name can be a string or a string[].

  If it is merged one day, we will not need anymore to compare type.
*/
const getAlbums = (photoIdentifier: PhotoIdentifier): Album[] => {
  const {
    node: { group_name }
  } = photoIdentifier

  if (typeof group_name === 'string') {
    return [
      {
        name: group_name
      }
    ]
  } else {
    return group_name.map(name => ({ name }))
  }
}

export const getAllMedias = async (): Promise<Media[]> => {
  const allMedias = []

  let hasNextPage = true
  let endCursor: CameraRollCursor

  while (hasNextPage) {
    const photoIdentifiersPage = await getPhotoIdentifiersPage(endCursor)

    const newMedias = photoIdentifiersPage.edges
      .map(photoIdentifier => formatMediasFromPhotoIdentifier(photoIdentifier))
      .flat()
    allMedias.push(...newMedias)

    hasNextPage = photoIdentifiersPage.page_info.has_next_page
    endCursor = photoIdentifiersPage.page_info.end_cursor
  }

  return allMedias
}

const isMediaAlreadyBackuped = (
  mediaToCheck: Media,
  backupedMedias: BackupedMedia[]
): boolean => {
  const isAlreadyBackuped = backupedMedias.some(
    backupedMedia =>
      mediaToCheck.name === backupedMedia.name &&
      mediaToCheck.remotePath === backupedMedia.remotePath
  )

  return isAlreadyBackuped
}

export const getMediasToBackup = async (
  client: CozyClient
): Promise<Media[]> => {
  const allMedias = await getAllMedias()

  const backupConfig = await getLocalBackupConfig(client)

  const mediasToBackup = allMedias.filter(
    allMedia => !isMediaAlreadyBackuped(allMedia, backupConfig.backupedMedias)
  )

  return mediasToBackup
}
