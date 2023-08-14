import ReceiveSharingIntent from '@mythologi/react-native-receive-sharing-intent'

import {
  clearFilesToUpload,
  getFilesToUpload,
  hasFilesToUpload,
  _handleReceivedFiles
} from '/app/domain/sharing/services/SharingService'
import { AndroidReceivedFile } from '/app/domain/sharing/models/ReceivedFile'
import {
  AndroidReceivedFileFixture,
  AndroidReceivedFileFixture2
} from '/app/domain/sharing/fixtures/AndroidReceivedFile'

jest.mock('@mythologi/react-native-receive-sharing-intent', () => ({
  getReceivedFiles: jest.fn(),
  clearReceivedFiles: jest.fn()
}))

jest.mock('cozy-minilog', () => {
  return (): { info: () => void; error: () => void } => ({
    info: jest.fn(),
    error: jest.fn()
  })
})

const mockReceiveSharingIntent = ReceiveSharingIntent as jest.Mocked<
  typeof ReceiveSharingIntent
>

describe('SharingService', () => {
  afterEach(() => {
    clearFilesToUpload()
  })

  it('should handle received files via callback', () => {
    const mockFile: AndroidReceivedFile = AndroidReceivedFileFixture
    _handleReceivedFiles(files => {
      expect(files).toEqual([mockFile])
    })

    const callbackPassedToGetReceivedFiles =
      mockReceiveSharingIntent.getReceivedFiles.mock.calls[0][0]

    callbackPassedToGetReceivedFiles([mockFile])
  })

  it('should handle errors when getting received files', () => {
    const errorMessage = 'Error getting files'
    _handleReceivedFiles(() => {
      // This should not be called if the library errors out
      expect(true).toBe(false)
    })

    mockReceiveSharingIntent.getReceivedFiles.mock.calls[0][1](errorMessage)
  })

  it('should handle multiple received files', () => {
    const mockFiles: AndroidReceivedFile[] = [
      AndroidReceivedFileFixture,
      AndroidReceivedFileFixture2
    ]
    _handleReceivedFiles(files => {
      expect(files).toEqual(mockFiles)
    })

    const callbackPassedToGetReceivedFiles =
      mockReceiveSharingIntent.getReceivedFiles.mock.calls[0][0]

    callbackPassedToGetReceivedFiles(mockFiles)
  })

  it('should return files to upload', () => {
    const mockFiles: AndroidReceivedFile[] = [AndroidReceivedFileFixture]
    _handleReceivedFiles(files => {
      expect(files).toEqual(mockFiles)
    })

    const callbackPassedToGetReceivedFiles =
      mockReceiveSharingIntent.getReceivedFiles.mock.calls[0][0]

    callbackPassedToGetReceivedFiles(mockFiles)

    const filesToUploadList = getFilesToUpload()
    expect(filesToUploadList.size).toBe(1)
    expect(filesToUploadList.get(AndroidReceivedFileFixture.filePath)).toEqual(
      AndroidReceivedFileFixture
    )
  })

  it('should indicate if there are files to upload', () => {
    expect(hasFilesToUpload()).toBe(false)

    const mockFiles: AndroidReceivedFile[] = [AndroidReceivedFileFixture]
    _handleReceivedFiles(files => {
      expect(files).toEqual(mockFiles)
    })

    const callbackPassedToGetReceivedFiles =
      mockReceiveSharingIntent.getReceivedFiles.mock.calls[0][0]

    callbackPassedToGetReceivedFiles(mockFiles)
    expect(hasFilesToUpload()).toBe(true)
  })

  it('should clear files to upload', () => {
    const mockFiles: AndroidReceivedFile[] = [AndroidReceivedFileFixture]
    _handleReceivedFiles(files => {
      expect(files).toEqual(mockFiles)
    })

    const callbackPassedToGetReceivedFiles =
      mockReceiveSharingIntent.getReceivedFiles.mock.calls[0][0]

    callbackPassedToGetReceivedFiles(mockFiles)
    expect(getFilesToUpload().size).toBe(1)

    clearFilesToUpload()
    expect(getFilesToUpload().size).toBe(0)
  })

  it('should avoid storing duplicate files', () => {
    const mockFile: AndroidReceivedFile = AndroidReceivedFileFixture

    _handleReceivedFiles(files => {
      expect(files).toHaveLength(2)
      expect(files[0]).toEqual(mockFile)
      expect(files[1]).toEqual(mockFile)
    })

    const callbackPassedToGetReceivedFiles =
      mockReceiveSharingIntent.getReceivedFiles.mock.calls[0][0]

    callbackPassedToGetReceivedFiles([mockFile, mockFile])

    const filesToUploadList = getFilesToUpload()

    // Even if the library sends the same file twice, the map should contain only one entry for that file
    expect(filesToUploadList.size).toBe(1)
    if (mockFile.filePath) {
      expect(filesToUploadList.get(mockFile.filePath)).toEqual(mockFile)
    } else {
      fail('Expected mockFile.filePath to be defined')
    }
  })
})
