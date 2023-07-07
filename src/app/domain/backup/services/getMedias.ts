import {
  CameraRoll,
  PhotoIdentifiersPage,
  PhotoIdentifier
} from '@react-native-camera-roll/camera-roll'

import { Media, BackupedMedia } from '/app/domain/backup/models/Media'
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

  if (subTypes.includes('PhotoLive')) {
    return [
      {
        name: filename.substring(0, filename.lastIndexOf('.')) + '.MOV',
        path: uri,
        type: 'video',
        subType: 'PhotoLive',
        creationDate: timestamp * 1000
      },
      {
        name: filename,
        path: uri,
        type: 'image',
        subType: 'PhotoLive',
        creationDate: timestamp * 1000
      }
    ]
  }

  return [
    {
      name: filename,
      path: uri,
      type: type.includes('image') ? 'image' : 'video',
      creationDate: timestamp * 1000
    }
  ]
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
    backupedMedia => mediaToCheck.name === backupedMedia.name
  )

  return isAlreadyBackuped
}

export const getMediasToBackup = async (
  client: CozyClient
): Promise<Media[]> => {
  const allMedias = await getAllMedias()

  const backupConfig = await getLocalBackupConfig(client)

  if (backupConfig === null) {
    return []
  }

  const mediasToBackup = allMedias.filter(
    allMedia => !isMediaAlreadyBackuped(allMedia, backupConfig.backupedMedias)
  )

  return mediasToBackup
}
