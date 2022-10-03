import MockBackHandler from 'react-native/Libraries/Utilities/__mocks__/BackHandler'
import React from 'react'
import { render } from '@testing-library/react-native'

import { CozyWebView } from './CozyWebView'

import { useIsSecureProtocol } from '/hooks/useIsSecureProtocol'

jest.mock('/hooks/useIsSecureProtocol')

jest.mock('react-native-fs', () => ({
  downloadFile: jest.fn(),
  DocumentDirectoryPath: '/app'
}))
jest.mock('react-native-file-viewer', () => ({
  open: jest.fn()
}))
jest.mock('@react-native-cookies/cookies', () => ({
  set: jest.fn()
}))
jest.mock('/libs/RootNavigation.js', () => ({
  navigationRef: {
    getCurrentRoute: jest.fn().mockReturnValue({ name: 'home' })
  }
}))

const mockGoBack = jest.fn()
const mockUseIsFocused = jest.fn()
const mockNativeIntent = {
  registerWebview: jest.fn(),
  unregisterWebview: jest.fn()
}

jest.mock('react-native/Libraries/Utilities/BackHandler', () => MockBackHandler)

const WebView = ({ onNavigationStateChange, navObject, TEST_ONLY_setRef }) => {
  const { useEffect } = require('react')

  useEffect(() => {
    if (navObject) {
      onNavigationStateChange(navObject)
    }
  }, [onNavigationStateChange, navObject])

  useEffect(() => {
    TEST_ONLY_setRef({ goBack: mockGoBack })
  }, [TEST_ONLY_setRef])

  return <div>WebView</div>
}

jest.mock('react-native-webview', () => ({
  WebView
}))

jest.mock('cozy-intent', () => ({
  useNativeIntent: () => mockNativeIntent
}))

jest.mock('cozy-client', () => ({
  useClient: jest.fn().mockReturnValue({})
}))

jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => mockUseIsFocused()
}))

jest.mock('../../hooks/useSession.js', () => ({
  useSession: () => ({
    shouldInterceptAuth: false,
    handleInterceptAuth: jest.fn(),
    consumeSessionToken: jest.fn()
  })
}))

describe('CozyWebview', () => {
  let consoleError

  beforeEach(() => {
    useIsSecureProtocol.mockReturnValue(true)
    /* eslint-disable no-console */
    consoleError = console.error
    console.error = jest.fn()
  })

  afterEach(() => {
    console.error = consoleError
    /* eslint-enable no-console */
  })

  it('handles onFocus scenario', () => {
    mockUseIsFocused.mockReturnValue(true)
    const { update } = render(
      <CozyWebView
        source={{ uri: 'home' }}
        route={{ name: 'home' }}
        navObject={{ canGoBack: false }}
      />
    )

    MockBackHandler.mockPressBack()
    expect(MockBackHandler.exitApp).toHaveBeenCalledTimes(1)
    MockBackHandler.mockPressBack()
    expect(MockBackHandler.exitApp).toHaveBeenCalledTimes(2)

    update(
      <CozyWebView
        source={{ uri: 'home' }}
        route={{ name: 'home' }}
        navObject={{ canGoBack: true }}
      />
    )

    MockBackHandler.mockPressBack()
    expect(mockGoBack).toHaveBeenCalledTimes(1)

    MockBackHandler.mockPressBack()
    expect(mockGoBack).toHaveBeenCalledTimes(2)
  })

  it('handles onFocus inversed', () => {
    mockUseIsFocused.mockReturnValue(true)

    const { update } = render(
      <CozyWebView
        source={{ uri: 'home' }}
        route={{ name: 'home' }}
        navObject={{ canGoBack: true }}
      />
    )

    MockBackHandler.mockPressBack()
    expect(mockGoBack).toHaveBeenCalledTimes(1)
    MockBackHandler.mockPressBack()
    expect(mockGoBack).toHaveBeenCalledTimes(2)

    update(
      <CozyWebView
        source={{ uri: 'home' }}
        route={{ name: 'home' }}
        navObject={{ canGoBack: false }}
      />
    )

    MockBackHandler.mockPressBack()
    expect(MockBackHandler.exitApp).toHaveBeenCalledTimes(1)
    MockBackHandler.mockPressBack()
    expect(MockBackHandler.exitApp).toHaveBeenCalledTimes(2)
  })

  it('handles notFocus scenario', () => {
    mockUseIsFocused.mockReturnValue(false)

    const { update } = render(
      <CozyWebView
        source={{ uri: 'home' }}
        route={{ name: 'home' }}
        navObject={{ canGoBack: false }}
      />
    )

    MockBackHandler.mockPressBack()
    expect(MockBackHandler.exitApp).toHaveBeenCalledTimes(1)
    MockBackHandler.mockPressBack()
    expect(MockBackHandler.exitApp).toHaveBeenCalledTimes(2)

    update(
      <CozyWebView
        source={{ uri: 'home' }}
        route={{ name: 'home' }}
        navObject={{ canGoBack: true }}
      />
    )

    MockBackHandler.mockPressBack()
    expect(mockGoBack).toHaveBeenCalledTimes(0)
    MockBackHandler.mockPressBack()
    expect(mockGoBack).toHaveBeenCalledTimes(0)
  })

  it('handles notFocus scenario inversed', () => {
    mockUseIsFocused.mockReturnValue(false)

    const { update } = render(
      <CozyWebView
        source={{ uri: 'home' }}
        route={{ name: 'home' }}
        navObject={{ canGoBack: true }}
      />
    )

    MockBackHandler.mockPressBack()
    expect(MockBackHandler.exitApp).toHaveBeenCalledTimes(1)
    MockBackHandler.mockPressBack()
    expect(MockBackHandler.exitApp).toHaveBeenCalledTimes(2)

    update(
      <CozyWebView
        source={{ uri: 'home' }}
        route={{ name: 'home' }}
        navObject={{ canGoBack: false }}
      />
    )

    MockBackHandler.mockPressBack()
    expect(mockGoBack).toHaveBeenCalledTimes(0)
    MockBackHandler.mockPressBack()
    expect(mockGoBack).toHaveBeenCalledTimes(0)
  })
})
