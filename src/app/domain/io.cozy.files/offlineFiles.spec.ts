import RNFS from 'react-native-fs'

import CozyClient, { createMockClient } from 'cozy-client'
import { FileDocument } from 'cozy-client/types/types'

import {
  downloadFile,
  getFilesFolder
} from '/app/domain/io.cozy.files/offlineFiles'
import {
  addOfflineFileToConfiguration,
  getOfflineFileFromConfiguration,
  OfflineFile,
  updateLastOpened
} from '/app/domain/io.cozy.files/offlineFilesConfiguration'
import {
  getDownloadUrlById,
  getFileById
} from '/app/domain/io.cozy.files/remoteFiles'

jest.mock('react-native-file-viewer', () => ({
  open: jest.fn()
}))
jest.mock('/app/domain/io.cozy.files/offlineFilesConfiguration', () => ({
  addOfflineFileToConfiguration: jest.fn(),
  getOfflineFileFromConfiguration: jest.fn(),
  updateLastOpened: jest.fn()
}))
jest.mock('/app/domain/io.cozy.files/remoteFiles', () => ({
  getFileById: jest.fn(),
  getDownloadUrlById: jest.fn()
}))

jest.mock('react-native-fs', () => {
  return {
    DocumentDirectoryPath: '/mockedDocumentDirectoryPath',
    downloadFile: jest.fn().mockImplementation(() => ({
      promise: Promise.resolve({
        jobId: 1,
        statusCode: 200,
        bytesWritten: 100,
        path: () => 'mocked-file-path'
      })
    })),
    mkdir: jest.fn(),
    unlink: jest.fn()
  }
})

const mockGetOfflineFileFromConfiguration =
  getOfflineFileFromConfiguration as jest.MockedFunction<typeof getOfflineFileFromConfiguration>
const mockGetFileById =
  getFileById as jest.MockedFunction<typeof getFileById>
const mockGetDownloadUrlById =
  getDownloadUrlById as jest.MockedFunction<typeof getDownloadUrlById>

describe('offlineFiles', () => {
  let mockClient: jest.Mocked<CozyClient>

  beforeEach(() => {
    const options = {
      clientOptions: {
        uri: 'http://claude.mycozy.cloud'
      }
    } as object
    mockClient = createMockClient(
      options
    ) as Partial<CozyClient> as jest.Mocked<CozyClient>
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getFilesFolder', () => {
    it('should return File path relative to instance url', () => {
      const result = getFilesFolder(mockClient)

      expect(result).toBe(
        '/mockedDocumentDirectoryPath/claude.mycozy.cloud/Files'
      )
    })
  })

  describe('downloadFile', () => {
    it('should download file if not existing', async () => {
      mockRemoteFile({
        _id: 'SOME_FILE_ID',
        _rev: 'SOME_REV',
        name: 'SOME_FILE_NAME'
      })
      mockDownloadUrl('SOME_FILE_DOWNLOAD_URL')
      mockFileFromConfiguration(undefined)
      const file = {
        _id: 'SOME_FILE_ID',
        name: 'SOME_FILE_NAME'
      } as unknown as FileDocument
      const result = await downloadFile(file, mockClient)

      expect(RNFS.downloadFile).toHaveBeenCalledWith({
        fromUrl: 'SOME_FILE_DOWNLOAD_URL',
        toFile:
          '/mockedDocumentDirectoryPath/claude.mycozy.cloud/Files/SOME_FILE_NAME',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        begin: expect.anything(),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        progress: expect.anything(),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        progressInterval: expect.anything()
      })
      expect(result).toBe(
        '/mockedDocumentDirectoryPath/claude.mycozy.cloud/Files/SOME_FILE_NAME'
      )
      expect(addOfflineFileToConfiguration).toHaveBeenCalledWith({
        id: 'SOME_FILE_ID',
        path: '/mockedDocumentDirectoryPath/claude.mycozy.cloud/Files/SOME_FILE_NAME',
        rev: 'SOME_REV'
      })
    })

    it('should not download file if existing', async () => {
      mockRemoteFile({
        _id: 'SOME_FILE_ID',
        _rev: 'SOME_REV',
        name: 'SOME_FILE_NAME'
      })
      mockFileFromConfiguration({
        id: 'SOME_FILE_ID',
        rev: 'SOME_REV',
        path: 'SOME_EXISTING_PATH_FROM_CACHE',
        lastOpened: new Date()
      })
      const file = {
        _id: 'SOME_FILE_ID',
        name: 'SOME_FILE_NAME'
      } as unknown as FileDocument
      const result = await downloadFile(file, mockClient)

      expect(RNFS.downloadFile).not.toHaveBeenCalled()
      expect(result).toBe('SOME_EXISTING_PATH_FROM_CACHE')
      expect(addOfflineFileToConfiguration).not.toHaveBeenCalled()
    })

    it('should update lastOpened attribute if file exists', async () => {
      mockRemoteFile({
        _id: 'SOME_FILE_ID',
        _rev: 'SOME_REV',
        name: 'SOME_FILE_NAME'
      })
      mockFileFromConfiguration({
        id: 'SOME_FILE_ID',
        rev: 'SOME_REV',
        path: 'SOME_EXISTING_PATH_FROM_CACHE',
        lastOpened: new Date()
      })
      const file = {
        _id: 'SOME_FILE_ID',
        name: 'SOME_FILE_NAME'
      } as unknown as FileDocument
      await downloadFile(file, mockClient)

      expect(updateLastOpened).toHaveBeenCalledWith('SOME_FILE_ID')
    })

    it('should download file if existing but with different rev', async () => {
      mockRemoteFile({
        _id: 'SOME_FILE_ID',
        _rev: 'SOME_NEW_REV',
        name: 'SOME_FILE_NAME'
      })
      mockDownloadUrl('SOME_NEW_FILE_DOWNLOAD_URL')
      mockFileFromConfiguration({
        id: 'SOME_FILE_ID',
        rev: 'SOME_REV',
        path: 'SOME_EXISTING_PATH_FROM_CACHE',
        lastOpened: new Date()
      })
      const file = {
        _id: 'SOME_FILE_ID',
        name: 'SOME_FILE_NAME'
      } as unknown as FileDocument
      const result = await downloadFile(file, mockClient)

      expect(RNFS.downloadFile).toHaveBeenCalledWith({
        fromUrl: 'SOME_NEW_FILE_DOWNLOAD_URL',
        toFile:
          '/mockedDocumentDirectoryPath/claude.mycozy.cloud/Files/SOME_FILE_NAME',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        begin: expect.anything(),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        progress: expect.anything(),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        progressInterval: expect.anything()
      })
      expect(result).toBe(
        '/mockedDocumentDirectoryPath/claude.mycozy.cloud/Files/SOME_FILE_NAME'
      )
      expect(addOfflineFileToConfiguration).toHaveBeenCalledWith({
        id: 'SOME_FILE_ID',
        path: '/mockedDocumentDirectoryPath/claude.mycozy.cloud/Files/SOME_FILE_NAME',
        rev: 'SOME_NEW_REV'
      })
    })

    it('should use new file name new rev with different name', async () => {
      mockRemoteFile({
        _id: 'SOME_FILE_ID',
        _rev: 'SOME_NEW_REV',
        name: 'SOME_NEW_FILE_NAME'
      })
      mockDownloadUrl('SOME_NEW_FILE_DOWNLOAD_URL')
      mockFileFromConfiguration({
        id: 'SOME_FILE_ID',
        rev: 'SOME_REV',
        path: 'SOME_EXISTING_PATH_FROM_CACHE',
        lastOpened: new Date()
      })
      const file = {
        _id: 'SOME_FILE_ID',
        name: 'SOME_FILE_NAME'
      } as unknown as FileDocument
      const result = await downloadFile(file, mockClient)

      expect(RNFS.downloadFile).toHaveBeenCalledWith({
        fromUrl: 'SOME_NEW_FILE_DOWNLOAD_URL',
        toFile:
          '/mockedDocumentDirectoryPath/claude.mycozy.cloud/Files/SOME_NEW_FILE_NAME',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        begin: expect.anything(),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        progress: expect.anything(),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        progressInterval: expect.anything()
      })
      expect(RNFS.unlink).toHaveBeenCalledWith('SOME_EXISTING_PATH_FROM_CACHE')
      expect(result).toBe(
        '/mockedDocumentDirectoryPath/claude.mycozy.cloud/Files/SOME_NEW_FILE_NAME'
      )
      expect(addOfflineFileToConfiguration).toHaveBeenCalledWith({
        id: 'SOME_FILE_ID',
        path: '/mockedDocumentDirectoryPath/claude.mycozy.cloud/Files/SOME_NEW_FILE_NAME',
        rev: 'SOME_NEW_REV'
      })
    })
  })
})

const mockFileFromConfiguration = (file: OfflineFile | undefined): void => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  mockGetOfflineFileFromConfiguration.mockResolvedValue(file)
}

const mockRemoteFile = (file: RemoteFile): void => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  mockGetFileById.mockResolvedValue(file as unknown as FileDocument)
}

const mockDownloadUrl = (url: string): void => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  mockGetDownloadUrlById.mockResolvedValue(url)
}

interface RemoteFile {
  _id: string
  _rev: string
  name: string
}
