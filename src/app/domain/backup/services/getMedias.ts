import {
  CameraRoll,
  PhotoIdentifiersPage,
  PhotoIdentifier
} from '@react-native-camera-roll/camera-roll'
import mime from 'mime/lite'
import { Platform } from 'react-native'
import RNFS from 'react-native-fs'

import type CozyClient from 'cozy-client'
import flag from 'cozy-flags'

import {
  Media,
  BackupedMedia,
  Album,
  ProgressCallback
} from '/app/domain/backup/models'
import { getLocalBackupConfig } from '/app/domain/backup/services/manageLocalBackupConfig'
import {
  getPathWithoutExtension,
  getPathWithoutFilename,
  isSameMedia
} from '/app/domain/backup/helpers'
import { getBackupInfo } from '/app/domain/backup/services/manageBackup'
import { t } from '/locales/i18n'

const MEDIAS_BY_PAGE = 500

type CameraRollCursor = string | undefined

export const getPhotoIdentifiersPage = async (
  after: CameraRollCursor
): Promise<PhotoIdentifiersPage> => {
  const shouldIncludeSharedAlbums = !!flag(
    'flagship.backup.includeSharedAlbums'
  )

  const photoIdentifiersPage = await CameraRoll.getPhotos({
    first: MEDIAS_BY_PAGE,
    after: after,
    include: ['filename', 'fileExtension', 'fileSize', 'albums', 'sourceType'],
    includeSharedAlbums: shouldIncludeSharedAlbums
  })

  return photoIdentifiersPage
}

export const getMimeType = (media: Media): string => {
  if (media.mimeType) {
    return media.mimeType
  }

  const guessedMimeType = mime.getType(media.name)

  if (guessedMimeType === null) {
    throw new Error(t('services.backup.errors.fileNotSupported'))
  }

  return guessedMimeType
}

export const getRemotePath = (uri: string): string => {
  if (Platform.OS === 'ios') {
    return '/'
  }

  if (Platform.OS === 'android') {
    const uriWithProtocolRemoved = uri.replace('file://', '')
    const uriWithExternalStorageDirectoryPathRemoved =
      uriWithProtocolRemoved.replace(RNFS.ExternalStorageDirectoryPath, '')

    const uriWithFilenameRemoved = getPathWithoutFilename(
      uriWithExternalStorageDirectoryPathRemoved
    )

    return uriWithFilenameRemoved
  }

  throw new Error(t('services.backup.errors.platformNotSupported'))
}

export const formatMediasFromPhotoIdentifier = (
  photoIdentifier: PhotoIdentifier
): Media[] => {
  const {
    node: {
      id,
      image: { filename, uri, fileSize },
      type,
      subTypes,
      sourceType,
      timestamp,
      modificationTimestamp
    }
  } = photoIdentifier

  if (filename === null) return []

  const albums = getAlbums(photoIdentifier)

  if (subTypes.includes('PhotoLive')) {
    return [
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id,
        name: getPathWithoutExtension(filename) + '.MOV',
        uri: uri,
        path: uri,
        remotePath: getRemotePath(uri),
        type: 'video',
        subType: 'PhotoLive',
        sourceType: sourceType,
        creationDate: Math.trunc(timestamp) * 1000,
        modificationDate: Math.trunc(modificationTimestamp) * 1000,
        albums,
        fileSize: null
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id,
        name: filename,
        uri: uri,
        path: uri,
        remotePath: getRemotePath(uri),
        type: 'image',
        subType: 'PhotoLive',
        sourceType: sourceType,
        creationDate: Math.trunc(timestamp) * 1000,
        modificationDate: Math.trunc(modificationTimestamp) * 1000,
        albums,
        fileSize
      }
    ]
  }

  return [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id,
      name: filename,
      uri: uri,
      path: uri,
      remotePath: getRemotePath(uri),
      type: type.includes('image') ? 'image' : 'video',
      sourceType: sourceType,
      mimeType: Platform.OS == 'android' ? type : undefined,
      creationDate: Math.trunc(timestamp) * 1000,
      modificationDate: Math.trunc(modificationTimestamp) * 1000,
      albums,
      fileSize
    }
  ]
}

export const getAlbums = (photoIdentifier: PhotoIdentifier): Album[] => {
  const {
    node: { group_name }
  } = photoIdentifier

  if (Array.isArray(group_name)) {
    return group_name.map(name => ({ name }))
  } else {
    return []
  }
}

/*
  On iOS, when the user takes a picture and add it to a shared albums, the picture will be duplicated :
  - it will be one time in the user library (with all the local albums where the picture is inside the albums field)
  - it will be one time in the shared album (with the shared album where the picture is inside the albums field)

  So here we merge these pictures to have only one picture and we merge the albums field.
*/
export const mergeUserLibraryAndCloudSharedMedias = (
  userLibraryMedias: Media[],
  cloudSharedMedias: Media[]
): Media[] => {
  const allMedias = [...userLibraryMedias]

  cloudSharedMedias.forEach(cloudSharedMedia => {
    const mediaIndex = allMedias.findIndex(media =>
      isSameMedia(media, cloudSharedMedia)
    )

    if (mediaIndex >= 0) {
      allMedias[mediaIndex].albums.push(...cloudSharedMedia.albums)
    } else {
      allMedias.push(cloudSharedMedia)
    }
  })

  return allMedias
}

export const getAllMedias = async (
  client: CozyClient,
  onProgress?: ProgressCallback
): Promise<Media[]> => {
  let backupInfo

  if (onProgress) {
    backupInfo = await getBackupInfo(client)
  }

  let hasNextPage = true
  let endCursor: CameraRollCursor

  const userLibraryMedias: Media[] = []
  const cloudSharedMedias: Media[] = []

  while (hasNextPage) {
    const photoIdentifiersPage = await getPhotoIdentifiersPage(endCursor)

    photoIdentifiersPage.edges.forEach(photoIdentifier => {
      const formattedMedias = formatMediasFromPhotoIdentifier(photoIdentifier)

      if (photoIdentifier.node.sourceType === 'CloudShared') {
        cloudSharedMedias.push(...formattedMedias)
      } else {
        userLibraryMedias.push(...formattedMedias)
      }
    })

    if (onProgress && backupInfo) {
      backupInfo.currentBackup.mediasLoadedCount =
        photoIdentifiersPage.edges.length

      void onProgress(backupInfo)
    }

    hasNextPage = photoIdentifiersPage.page_info.has_next_page
    endCursor = photoIdentifiersPage.page_info.end_cursor
  }

  const allMedias = mergeUserLibraryAndCloudSharedMedias(
    userLibraryMedias,
    cloudSharedMedias
  )

  return allMedias
}

const isMediaAlreadyBackuped = (
  mediaToCheck: Media,
  backupedMedias: BackupedMedia[]
): boolean => {
  const isAlreadyBackuped = backupedMedias.some(backupedMedia =>
    isSameMedia(mediaToCheck, backupedMedia)
  )

  return isAlreadyBackuped
}

export const getMediasToBackup = async (
  client: CozyClient,
  onProgress?: ProgressCallback
): Promise<Media[]> => {
  const allMedias = await getAllMedias(client, onProgress)

  const backupConfig = await getLocalBackupConfig(client)

  const mediasToBackup = allMedias.filter(
    allMedia => !isMediaAlreadyBackuped(allMedia, backupConfig.backupedMedias)
  )

  return mediasToBackup
}
