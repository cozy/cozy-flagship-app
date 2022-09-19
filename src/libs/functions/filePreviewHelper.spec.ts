/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import FileViewer from 'react-native-file-viewer'
import CozyClient from 'cozy-client'
import RNFS, { DownloadResult } from 'react-native-fs'

import {
  checkIsPreviewableLink,
  getFileExtentionFromCozyDownloadUrl,
  previewFileFromDownloadUrl,
  PUBLIC_BY_SECRET_DOWNLOAD_LINK,
  PRIVATE_BY_PATH_DOWNLOAD_LINK
} from './filePreviewHelper'

jest.mock('react-native-file-viewer', () => ({
  open: jest.fn()
}))

interface DownloadFileT {
  promise: Promise<{ statusCode: number }>
}
const mockDownloadFile = jest.fn() as jest.MockedFunction<
  typeof RNFS.downloadFile
>
jest.mock('react-native-fs', () => ({
  downloadFile: (args: RNFS.DownloadFileOptions): DownloadFileT =>
    mockDownloadFile(args),
  DocumentDirectoryPath: '/app'
}))

describe('filePreviewHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('checkIsPreviewableLink', () => {
    it.each([
      [
        `Should return 'PUBLIC_BY_SECRET_DOWNLOAD_LINK' for a '/files/downloads/:secret/:name' link`,
        PUBLIC_BY_SECRET_DOWNLOAD_LINK,
        'https://claude.mycozy.cloud/files/downloads/SOME_SECRET/2022-08-29_some_connector.pdf',
        'https://claude.mycozy.cloud'
      ],
      [
        `Should return 'PUBLIC_BY_SECRET_DOWNLOAD_LINK' for a '/files/downloads/:secret/:name' link from another Cozy`,
        PUBLIC_BY_SECRET_DOWNLOAD_LINK,
        'https://claude.mycozy.cloud/files/downloads/SOME_SECRET/2022-08-29_some_connector.pdf',
        'https://alice.mycozy.cloud'
      ],
      [
        `Should return 'PRIVATE_BY_PATH_DOWNLOAD_LINK' for a 'files/download?Path=' link`,
        PRIVATE_BY_PATH_DOWNLOAD_LINK,
        'https://claude.mycozy.cloud/files/download?Path=/Documents/SOME_FILE.pdf&Dl=1',
        'https://claude.mycozy.cloud'
      ],
      [
        `Should return false for a 'files/download/:file-id' link`,
        false,
        'https://claude.mycozy.cloud/files/download/SOME_ID',
        'https://claude.mycozy.cloud'
      ],
      [
        `Should return false for a 'files/download?Path=' link from another Cozy`,
        false,
        'https://claude.mycozy.cloud/files/download?Path=/Documents/SOME_FILE.pdf&Dl=1',
        'https://alice.mycozy.cloud'
      ]
    ])('%p', (reason, result, url, cozyUrl) => {
      const client = {
        getStackClient: jest.fn(() => ({
          uri: cozyUrl
        }))
      } as unknown as typeof CozyClient

      expect(checkIsPreviewableLink(url, client)).toEqual(result)
    })
  })

  describe('previewFileFromDownloadUrl', () => {
    it(`should preview '/files/downloads/:secret/:name' links`, async () => {
      const client = {
        getStackClient: jest.fn(() => ({
          uri: 'https://claude.mycozy.cloud',
          getAuthorizationHeader: jest
            .fn()
            .mockReturnValue('SOME_AUTHORIZATION_TOKEN')
        }))
      } as unknown as CozyClient

      mockSuccessFileDownload()

      await previewFileFromDownloadUrl({
        downloadUrl:
          'https://claude.mycozy.cloud/files/downloads/SOME_SECRET/SOME_FILE.pdf?Dl=1',
        client,
        setDownloadProgress: () => undefined
      })

      expect(mockDownloadFile).toHaveBeenCalledWith({
        fromUrl:
          'https://claude.mycozy.cloud/files/downloads/SOME_SECRET/SOME_FILE.pdf?Dl=1',
        toFile: '/app/SOME_FILE.pdf',
        begin: expect.anything(),
        progress: expect.anything(),
        progressInterval: 100
      })
      expect(FileViewer.open).toHaveBeenCalledWith('/app/SOME_FILE.pdf')
    })

    it(`should preview '/files/download?Path=' links`, async () => {
      const client = {
        getStackClient: jest.fn(() => ({
          uri: 'https://claude.mycozy.cloud',
          getAuthorizationHeader: jest
            .fn()
            .mockReturnValue('SOME_AUTHORIZATION_TOKEN')
        }))
      } as unknown as CozyClient

      mockSuccessFileDownload()

      await previewFileFromDownloadUrl({
        downloadUrl:
          'https://claude.mycozy.cloud/files/download?Path=/Documents/SOME_FILE.pdf&Dl=1',
        client,
        setDownloadProgress: () => undefined
      })

      expect(mockDownloadFile).toHaveBeenCalledWith({
        fromUrl:
          'https://claude.mycozy.cloud/files/download?Path=/Documents/SOME_FILE.pdf&Dl=1',
        headers: {
          Authorization: 'SOME_AUTHORIZATION_TOKEN'
        },
        toFile: '/app/SOME_FILE.pdf',
        begin: expect.anything(),
        progress: expect.anything(),
        progressInterval: 100
      })
      expect(FileViewer.open).toHaveBeenCalledWith('/app/SOME_FILE.pdf')
    })
  })

  describe('getFileExtentionFromCozyDownloadUrl', () => {
    it(`should handle PDF extension`, () => {
      const downloadUrl =
        'https://claude.mycozy.cloud/files/download?Path=/Documents/SOME_FILE.pdf&Dl=1'
      const previewType = PRIVATE_BY_PATH_DOWNLOAD_LINK

      const extension = getFileExtentionFromCozyDownloadUrl(
        downloadUrl,
        previewType
      )

      expect(extension).toBe('pdf')
    })

    it(`should handle MP4 extension`, () => {
      const downloadUrl =
        'https://claude.mycozy.cloud/files/downloads/SOME_SECRET/SOME_FILE.mp4?Dl=1'
      const previewType = PUBLIC_BY_SECRET_DOWNLOAD_LINK

      const extension = getFileExtentionFromCozyDownloadUrl(
        downloadUrl,
        previewType
      )

      expect(extension).toBe('mp4')
    })

    it(`should only takes the last part of extension`, () => {
      const downloadUrl =
        'https://claude.mycozy.cloud/files/downloads/SOME_SECRET/SOME_FILE.multiple.part.extension.pdf?Dl=1'
      const previewType = PUBLIC_BY_SECRET_DOWNLOAD_LINK

      const extension = getFileExtentionFromCozyDownloadUrl(
        downloadUrl,
        previewType
      )

      expect(extension).toBe('pdf')
    })

    it(`should lowecase extension`, () => {
      const downloadUrl =
        'https://claude.mycozy.cloud/files/downloads/SOME_SECRET/SOME_FILE.MP4?Dl=1'
      const previewType = PUBLIC_BY_SECRET_DOWNLOAD_LINK

      const extension = getFileExtentionFromCozyDownloadUrl(
        downloadUrl,
        previewType
      )

      expect(extension).toBe('mp4')
    })
  })
})

const mockSuccessFileDownload = (): void => {
  mockDownloadFile.mockReturnValue({
    jobId: 1,
    promise: Promise.resolve({ statusCode: 200 } as unknown as DownloadResult)
  })
}
