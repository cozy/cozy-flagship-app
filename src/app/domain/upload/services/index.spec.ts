import { uploadFile } from '/app/domain/upload/services/upload'

import * as UploadService from './index'

import type { IOCozyFile } from 'cozy-client'

jest.mock('/app/domain/upload/services/upload', () => ({
  uploadFile: jest.fn()
}))

const mockedUploadFile = uploadFile as jest.MockedFunction<typeof uploadFile>

const DEFAULT_UPLOAD_PARAMS = {
  url: '',
  token: '',
  filename: '',
  filepath: '',
  mimetype: ''
}

const DEFAULT_UPLOAD_RESULT = {
  statusCode: 200,
  data: {} as IOCozyFile
}

describe('uploadFileWithRetryAndConflictStrategy', () => {
  it('should not retry if no retry policy; and fail if request fail', async () => {
    mockedUploadFile.mockImplementationOnce(() => {
      throw new Error('First error')
    })

    const spy = jest.spyOn(
      UploadService,
      'uploadFileWithRetryAndConflictStrategy'
    )

    await expect(
      UploadService.uploadFileWithRetryAndConflictStrategy({
        ...DEFAULT_UPLOAD_PARAMS
      })
    ).rejects.toThrow()

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should not retry if no retry policy; and succeed if request succeed', async () => {
    mockedUploadFile.mockImplementationOnce(() => {
      return Promise.resolve(DEFAULT_UPLOAD_RESULT)
    })

    const spy = jest.spyOn(
      UploadService,
      'uploadFileWithRetryAndConflictStrategy'
    )

    await expect(
      UploadService.uploadFileWithRetryAndConflictStrategy({
        ...DEFAULT_UPLOAD_PARAMS
      })
    ).resolves.toBe(DEFAULT_UPLOAD_RESULT)

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should retry if retry policy; and fail if last request fail', async () => {
    mockedUploadFile
      .mockImplementationOnce(() => {
        throw new Error('First error')
      })
      .mockImplementationOnce(() => {
        throw new Error('Second error')
      })

    const spy = jest.spyOn(
      UploadService,
      'uploadFileWithRetryAndConflictStrategy'
    )

    await expect(
      UploadService.uploadFileWithRetryAndConflictStrategy({
        ...DEFAULT_UPLOAD_PARAMS,
        retry: {
          nRetry: 1,
          shouldRetryCallback: () => true
        }
      })
    ).rejects.toThrow()

    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('should retry if retry policy; and succeed if last request succeed', async () => {
    mockedUploadFile
      .mockImplementationOnce(() => {
        throw new Error('First error')
      })
      .mockImplementationOnce(() => {
        return Promise.resolve(DEFAULT_UPLOAD_RESULT)
      })

    const spy = jest.spyOn(
      UploadService,
      'uploadFileWithRetryAndConflictStrategy'
    )

    await expect(
      UploadService.uploadFileWithRetryAndConflictStrategy({
        ...DEFAULT_UPLOAD_PARAMS,
        retry: {
          nRetry: 1,
          shouldRetryCallback: () => true
        }
      })
    ).resolves.toBe(DEFAULT_UPLOAD_RESULT)

    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('should execute complex retry callback using error argument; and fail if not retryable', async () => {
    mockedUploadFile.mockImplementationOnce(() => {
      throw new Error('Fatal error')
    })
    const spy = jest.spyOn(
      UploadService,
      'uploadFileWithRetryAndConflictStrategy'
    )

    await expect(
      UploadService.uploadFileWithRetryAndConflictStrategy({
        ...DEFAULT_UPLOAD_PARAMS,
        retry: {
          nRetry: 1,
          shouldRetryCallback: error => {
            if (error.message === 'Fatal error') return false
            return true
          }
        }
      })
    ).rejects.toThrow()

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should execute complex retry callback using error argument; and succeed if retryable', async () => {
    mockedUploadFile
      .mockImplementationOnce(() => {
        throw new Error('Normal error')
      })
      .mockImplementationOnce(() => {
        return Promise.resolve(DEFAULT_UPLOAD_RESULT)
      })

    const spy = jest.spyOn(
      UploadService,
      'uploadFileWithRetryAndConflictStrategy'
    )

    await expect(
      UploadService.uploadFileWithRetryAndConflictStrategy({
        ...DEFAULT_UPLOAD_PARAMS,
        retry: {
          nRetry: 1,
          shouldRetryCallback: error => {
            if (error.message === 'Fatal error') return false
            return true
          }
        }
      })
    ).resolves.toBe(DEFAULT_UPLOAD_RESULT)

    expect(spy).toHaveBeenCalledTimes(2)
  })
})
