/* eslint-disable promise/always-return */
import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import RNFileSystem from 'react-native-fs'

import { getMimeType } from '/app/domain/backup/services/getMedias'
import { Media, UploadMediaResult } from '/app/domain/backup/models/Media'
import { t } from '/locales/i18n'

import CozyClient, { StackErrors, IOCozyFile } from 'cozy-client'

const getVideoPathFromLivePhoto = (photoPath: string): string => {
  return photoPath.substring(0, photoPath.lastIndexOf('.')) + '.MOV'
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

let currentUploadId: string | undefined

export const getCurrentUploadId = (): string | undefined => {
  return currentUploadId
}

const setCurrentUploadId = (value: string): void => {
  currentUploadId = value
}

export const uploadMedia = async (
  client: CozyClient,
  uploadUrl: string,
  media: Media
): Promise<UploadMediaResult> => {
  const filepath = await getRealFilepath(media)

  return new Promise((resolve, reject) => {
    RNFileSystem.uploadFiles({
      toUrl: uploadUrl,
      files: [
        {
          name: media.name,
          filename: media.name,
          filetype: media.type,
          filepath
        }
      ],
      binaryStreamOnly: true,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': getMimeType(media),
        Authorization: `Bearer ${
          // @ts-expect-error Type issue which will be fixed in another PR
          client.getStackClient().token.accessToken as string
        }`
      },
      begin: ({ jobId }) => {
        setCurrentUploadId(jobId.toString())
      }
    })
      .promise.then(response => {
        if (response.statusCode == 201) {
          const { data } = JSON.parse(response.body) as {
            data: IOCozyFile
          }
          resolve({
            statusCode: response.statusCode,
            data
          })
        } else {
          const { errors } = JSON.parse(response.body) as StackErrors

          reject({
            statusCode: response.statusCode,
            errors
          })
        }
      })
      .catch(e => {
        reject(e)
      })
  })
}

export const cancelUpload = (uploadId: string): Promise<void> => {
  return new Promise(resolve => {
    resolve(RNFileSystem.stopUpload(parseInt(uploadId)))
  })
}
