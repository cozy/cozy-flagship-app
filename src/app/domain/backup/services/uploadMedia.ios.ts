/* eslint-disable promise/always-return */
import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import RNFileSystem from 'react-native-fs'

import { Media, UploadMediaResult } from '/app/domain/backup/models/Media'

import CozyClient, { StackErrors, IOCozyFile } from 'cozy-client'

const getVideoPathFromLivePhoto = (photoPath: string): string => {
  return photoPath.substring(0, photoPath.lastIndexOf('.')) + '.mov'
}

const getRealFilepath = async (media: Media): Promise<string> => {
  const data = await CameraRoll.iosGetImageDataById(media.path)

  let filepath = data.node.image.filepath

  if (filepath === null) {
    throw new Error('Impossible to get a real filepath')
  }

  filepath = filepath.replace('file://', '')

  if (media.type === 'image') {
    return filepath
  } else if (media.type === 'video' && media.subType === 'PhotoLive') {
    return getVideoPathFromLivePhoto(filepath)
  }

  throw new Error('Impossible to get a real filepath')
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
        'Content-Type': media.type,
        Authorization: `Bearer ${
          // @ts-expect-error Type issue which will be fixed in another PR
          client.getStackClient().token.accessToken as string
        }`
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