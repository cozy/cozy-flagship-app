/* eslint-disable promise/always-return */
import Minilog from '@cozy/minilog'
import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import { Platform } from 'react-native'
import RNBackgroundUpload, {
  UploadOptions
} from 'react-native-background-upload'
import RNFileSystem from 'react-native-fs'

import { setMediaAsBackuped } from '/app/domain/backup/services/manageLocalBackupConfig'
import { Media } from '/app/domain/backup/models/Media'

import type CozyClient from 'cozy-client'

const log = Minilog('💿 Backup')

interface UploadMediaResult {
  success: boolean
  data?: object
}

export const uploadMedias = async (
  client: CozyClient,
  backupFolderId: string,
  mediasToUpload: Media[]
): Promise<boolean> => {
  for (const mediaToUpload of mediasToUpload) {
    try {
      const uploadUrl = getUploadUrl(client, backupFolderId, mediaToUpload)

      const { success } = await uploadMedia(client, uploadUrl, mediaToUpload)

      if (success) {
        log.debug(`✅ ${mediaToUpload.name} uploaded`)
        await setMediaAsBackuped(client, mediaToUpload)
      } else {
        log.debug(`❌ ${mediaToUpload.name} not uploaded`)
      }
    } catch (e) {
      log.debug(`❌ ${mediaToUpload.name} not uploaded`)
      log.debug(e)
    }
  }

  return true
}

const uploadMedia = async (
  client: CozyClient,
  uploadUrl: string,
  media: Media
): Promise<UploadMediaResult> => {
  if (Platform.OS === 'android') {
    return await uploadMediaAndroid(client, uploadUrl, media)
  } else if (Platform.OS === 'ios') {
    return await uploadMediaIOS(client, uploadUrl, media)
  }

  return { success: false }
}

const uploadMediaAndroid = async (
  client: CozyClient,
  uploadUrl: string,
  media: Media
): Promise<UploadMediaResult> => {
  const filepath = media.path.replace('file://', '')

  return new Promise((resolve, reject) => {
    const options = {
      url: uploadUrl,
      path: filepath,
      method: 'POST',
      type: 'raw',
      headers: {
        Accept: 'application/json',
        'Content-Type': media.type,
        Authorization: `Bearer ${
          // @ts-expect-error Type issue which will be fixed in another PR
          client.getStackClient().token.accessToken as string
        }`
      },
      notification: {
        enabled: false
      }
    } as UploadOptions

    RNBackgroundUpload.startUpload(options)
      .then(uploadId => {
        RNBackgroundUpload.addListener('error', uploadId, error => {
          reject({ success: false, data: error })
        })
        RNBackgroundUpload.addListener('cancelled', uploadId, data => {
          reject({ success: false, data })
        })
        RNBackgroundUpload.addListener('completed', uploadId, data => {
          if (data.responseCode === 201) {
            resolve({ success: true, data })
          } else {
            reject({ success: false, data })
          }
        })
      })
      .catch(e => {
        reject({ status: false, data: e as unknown })
      })
  })
}

const uploadMediaIOS = async (
  client: CozyClient,
  uploadUrl: string,
  media: Media
): Promise<UploadMediaResult> => {
  let filepath: string

  if (media.type === 'image') {
    const data = await CameraRoll.iosGetImageDataById(media.path)

    if (data.node.image.filepath === null) {
      return { success: false }
    }

    filepath = data.node.image.filepath.replace('file://', '')
  } else {
    try {
      await RNFileSystem.unlink(
        RNFileSystem.TemporaryDirectoryPath + media.name
      )
    } catch {
      // we try to remove temporary file just in case it exists
    }

    filepath = await RNFileSystem.copyAssetsVideoIOS(
      media.path,
      RNFileSystem.TemporaryDirectoryPath + media.name
    )
  }

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

const getUploadUrl = (
  client: CozyClient,
  backupFolderId: string,
  media: Media
): string => {
  const createdAt = new Date(media.creationDate).toISOString()

  const toURL =
    client.getStackClient().uri +
    '/files/' +
    backupFolderId +
    '?Name=' +
    encodeURIComponent(media.name) +
    '&Type=file&Tags=library&Executable=false&CreatedAt=' +
    createdAt +
    '&UpdatedAt=' +
    createdAt

  return toURL
}
