/* eslint-disable promise/always-return */
import RNFileSystem from 'react-native-fs'

import { StackErrors, IOCozyFile } from 'cozy-client'

import { UploadParams, UploadResult } from '/app/domain/upload/models'

let currentUploadId: string | undefined

export const getCurrentUploadId = (): string | undefined => {
  return currentUploadId
}

const setCurrentUploadId = (value: string): void => {
  currentUploadId = value
}

export const uploadFile = async ({
  url,
  token,
  filename,
  filepath,
  mimetype
}: UploadParams): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    RNFileSystem.uploadFiles({
      toUrl: url,
      files: [
        {
          name: filename,
          filename: filename,
          filetype: mimetype,
          filepath
        }
      ],
      binaryStreamOnly: true,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': mimetype,
        Authorization: `Bearer ${token}`
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
