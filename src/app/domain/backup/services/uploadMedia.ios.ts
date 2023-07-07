/* eslint-disable promise/always-return */
import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import RNFileSystem from 'react-native-fs'

import { Media } from '/app/domain/backup/models/Media'

import type CozyClient from 'cozy-client'

interface UploadMediaResult {
  success: boolean
  data?: object
}

export const uploadMedia = async (
  client: CozyClient,
  uploadUrl: string,
  media: Media
): Promise<UploadMediaResult> => {
  const data = await CameraRoll.iosGetImageDataById(media.path)

  if (data.node.image.filepath === null) {
    return { success: false }
  }

  const filepath = data.node.image.filepath.replace('file://', '')

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
          resolve({ success: true, data: response })
        } else {
          reject({ success: false, data: response })
        }
      })
      .catch(e => {
        reject({ status: false, data: e as unknown })
      })
  })
}
