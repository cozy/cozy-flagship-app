import { Linking } from 'react-native'

import { webviewUrlLog } from '/app/domain/navigation/webviews/UrlModels'
import {
  isHttpOrHttps,
  openUrlWithOs
} from '/app/domain/navigation/webviews/UrlUtils'
import { safePromise } from '/utils/safePromise'

jest.mock('react-native', () => ({
  Linking: {
    openURL: jest.fn()
  }
}))

jest.mock('/app/domain/navigation/webviews/UrlModels', () => ({
  webviewUrlLog: { error: jest.fn() }
}))

// eslint-disable-next-line @typescript-eslint/unbound-method
const mockedOpenURL = Linking.openURL as jest.MockedFunction<
  typeof Linking.openURL
>
const mockedWebviewUrlLog = webviewUrlLog.error as jest.MockedFunction<
  typeof webviewUrlLog.error
>

describe('_isNotHttpOrHttps', () => {
  test('should return false when the URL is not HTTP or HTTPS', () => {
    // Arrange
    const url = 'ftp://test.com'

    // Act
    const result = isHttpOrHttps(url)

    // Assert
    expect(result).toBe(false)
  })

  test('should return true when the URL is HTTP', () => {
    // Arrange
    const url = 'http://test.com'

    // Act
    const result = isHttpOrHttps(url)

    // Assert
    expect(result).toBe(true)
  })

  test('should return true when the URL is HTTPS', () => {
    // Arrange
    const url = 'https://test.com'

    // Act
    const result = isHttpOrHttps(url)

    // Assert
    expect(result).toBe(true)
  })
})

describe('_handleNonHttpOrHttps with safePromise', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    jest.clearAllMocks()
  })

  test('should call _handleNonHttpOrHttps inside safePromise when the URL is not HTTP or HTTPS', () => {
    // Arrange
    const url = 'ftp://test.com'

    // Act
    safePromise(openUrlWithOs)(url)

    // Assert
    expect(mockedOpenURL).toHaveBeenCalledWith(url)
  })

  test('should call devlog on error', () => {
    // Arrange
    const url = 'ftp://test.com'
    const error = new Error('test error')

    // Force Linking.openURL to throw an error
    mockedOpenURL.mockImplementationOnce(() => {
      throw error
    })

    // Act
    safePromise(openUrlWithOs)(url)

    // Assert
    expect(mockedWebviewUrlLog).toHaveBeenCalledWith(
      `Could not open url "${url}" with operating system`,
      error.message
    )
  })
})
