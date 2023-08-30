import { CameraRoll } from '@react-native-camera-roll/camera-roll'

import { getMimeType } from '/app/domain/backup/services/getMedias'
import { Media } from '/app/domain/backup/models/Media'
import {
  getPathExtension,
  getPathWithoutExtension
} from '/app/domain/backup/helpers'
import { t } from '/locales/i18n'
import { uploadFileWithRetryAndConflictStrategy } from '/app/domain/upload/services'
import { UploadResult } from '/app/domain/upload/models'
import { shouldRetryCallbackBackup } from '/app/domain/backup/helpers/error'

import CozyClient from 'cozy-client'

export const getVideoPathFromLivePhoto = (photoPath: string): string => {
  const extension = getPathExtension(photoPath)

  if (extension === extension.toUpperCase()) {
    // Path is something like IMG_001.MOV
    return getPathWithoutExtension(photoPath) + '.MOV'
  } else {
    // When Live Photo has been modified, path is something like FullSizeRender.mov
    return getPathWithoutExtension(photoPath) + '.mov'
  }
}

const getRealFilepath = async (media: Media): Promise<string> => {
  const data = await CameraRoll.iosGetImageDataById(media.path)

  let filepath = data.node.image.filepath

  if (filepath === null) {
    throw new Error(t('services.backup.errors.fileNotFound'))
  }

  filepath = filepath.replace('file://', '')

  if (media.type === 'video' && media.subType === 'PhotoLive') {
    return getVideoPathFromLivePhoto(filepath)
  }

  return filepath
}

export const uploadMedia = async (
  client: CozyClient,
  uploadUrl: string,
  media: Media
): Promise<UploadResult> => {
  const filepath = await getRealFilepath(media)

  return uploadFileWithRetryAndConflictStrategy({
    url: uploadUrl,
    token: client.getStackClient().token.accessToken as string,
    filename: media.name,
    filepath,
    mimetype: getMimeType(media),
    retry: {
      nRetry: 1,
      shouldRetryCallback: shouldRetryCallbackBackup
    }
  })
}
