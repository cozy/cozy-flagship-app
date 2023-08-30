import OsReceiveSharingIntent, {
  SharedFile
} from '@mythologi/react-native-receive-sharing-intent'

import { handleReceivedFiles } from '/app/domain/osReceive/services/OsReceiveData'
import { OsReceiveLogger } from '/app/domain/osReceive'

jest.mock('@mythologi/react-native-receive-sharing-intent')
jest.mock('/app/domain/osReceive')

describe('OsReceiveData Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('processes received files and invokes the callback', () => {
    const mockFiles = [
      { filePath: 'path1', otherProperties: '...' },
      { filePath: 'path2', otherProperties: '...' }
    ]

    ;(OsReceiveSharingIntent.getReceivedFiles as jest.Mock).mockImplementation(
      successCallback => {
        const successCallbackAsFunction = successCallback as (
          files: SharedFile[]
        ) => void
        successCallbackAsFunction(mockFiles)
      }
    )

    const callback = jest.fn()

    handleReceivedFiles(callback)

    expect(callback).toHaveBeenCalledWith(mockFiles)
    expect(OsReceiveLogger.info).toHaveBeenCalledWith(
      'Received files',
      mockFiles
    )
  })

  it('handles failure in receiving files', () => {
    const mockError = new Error('Failed to get files')

    ;(OsReceiveSharingIntent.getReceivedFiles as jest.Mock).mockImplementation(
      (_successCallback, errorCallback) => {
        const errorCallbackAsFunction = errorCallback as (
          error: unknown
        ) => void
        errorCallbackAsFunction(mockError)
      }
    )

    handleReceivedFiles()

    expect(OsReceiveLogger.error).toHaveBeenCalledWith(
      'Could not get received files',
      mockError
    )
  })
})
