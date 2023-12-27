/* eslint-disable @typescript-eslint/unbound-method */
import type CozyClient from 'cozy-client'

import RNFS from 'react-native-fs'
import Share from 'react-native-share'

import { fetchFilesByIds } from '/app/domain/osReceive/services/shareFilesService'

jest.mock('react-native-fs', () => {
  return {
    DocumentDirectoryPath: '/mockedPath/to/download',
    downloadFile: jest.fn().mockImplementation(() => ({
      promise: Promise.resolve({
        jobId: 1,
        statusCode: 200,
        bytesWritten: 100,
        path: () => 'mocked-file-path'
      })
    }))
  }
})

jest.mock('react-native-share', () => ({
  open: jest.fn()
}))

const mockRNFS = RNFS as jest.Mocked<typeof RNFS>
const mockFetchJSON = jest.fn()
const mockCozyClient = {
  getStackClient: jest.fn(() => ({
    uri: 'http://mocked-uri',
    fetchJSON: mockFetchJSON,
    getAuthorizationHeader: (): string => 'mocked-authorization-header'
  }))
} as unknown as CozyClient

const mockSuccessfulMetadataResponse = (
  fileId: string
): {
  data: {
    attributes: {
      name: string
    }
  }
} => ({
  data: { attributes: { name: `${fileId}-name.pdf` } }
})

describe('fetchFilesByIds', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should successfully fetch file metadata, download files, and share them', async () => {
    const fileIds = ['123', '456']

    fileIds.forEach(fileId =>
      mockFetchJSON.mockResolvedValueOnce(
        mockSuccessfulMetadataResponse(fileId)
      )
    )

    // @ts-expect-error: RNFS is mocked
    mockRNFS.downloadFile.mockImplementation(() => ({
      promise: Promise.resolve({
        jobId: 1,
        statusCode: 200,
        bytesWritten: 100,
        path: () => 'mocked-file-path'
      })
    }))

    await fetchFilesByIds(mockCozyClient, fileIds)

    expect(mockCozyClient.getStackClient().fetchJSON).toHaveBeenCalledTimes(
      fileIds.length
    )
    expect(mockRNFS.downloadFile).toHaveBeenCalledTimes(fileIds.length)
    expect(Share.open).toHaveBeenCalledWith({
      urls: [
        'file:///mockedPath/to/download/123-name.pdf',
        'file:///mockedPath/to/download/456-name.pdf'
      ]
    })
  })

  it('should handle errors in fetching file metadata', async () => {
    mockFetchJSON.mockRejectedValueOnce(new Error('Metadata Fetch Error'))

    await expect(fetchFilesByIds(mockCozyClient, ['123'])).rejects.toThrow(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect.any(Error)
    )

    expect(Share.open).not.toHaveBeenCalled()
  })

  it('should handle errors in fetching one file metadata among multiple', async () => {
    mockFetchJSON.mockResolvedValueOnce(mockSuccessfulMetadataResponse('123'))
    mockFetchJSON.mockRejectedValueOnce(new Error('Metadata Fetch Error'))

    await expect(
      fetchFilesByIds(mockCozyClient, ['123', '456'])
    ).rejects.toThrow(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect.any(Error)
    )

    expect(Share.open).not.toHaveBeenCalled()
  })

  it('should handle errors in downloading a file', async () => {
    mockFetchJSON.mockResolvedValueOnce(mockSuccessfulMetadataResponse('123'))

    // @ts-expect-error: RNFS is mocked
    mockRNFS.downloadFile.mockImplementation(() => ({
      promise: Promise.resolve({
        jobId: 1,
        statusCode: 404,
        bytesWritten: 100,
        path: () => 'mocked-file-path'
      })
    }))

    await expect(fetchFilesByIds(mockCozyClient, ['123'])).rejects.toThrow(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect.any(Error)
    )

    expect(Share.open).not.toHaveBeenCalled()
  })

  it('should handle errors in downloading one file among multiple', async () => {
    const fileIds = ['123', '456']

    fileIds.forEach(fileId =>
      mockFetchJSON.mockResolvedValueOnce(
        mockSuccessfulMetadataResponse(fileId)
      )
    )

    // @ts-expect-error: RNFS is mocked
    mockRNFS.downloadFile.mockImplementationOnce(() => ({
      promise: Promise.resolve({
        jobId: 1,
        statusCode: 404,
        bytesWritten: 100,
        path: () => 'mocked-file-path'
      })
    }))

    await expect(
      fetchFilesByIds(mockCozyClient, ['123', '456'])
    ).rejects.toThrow(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect.any(Error)
    )

    expect(Share.open).not.toHaveBeenCalled()
  })
})
