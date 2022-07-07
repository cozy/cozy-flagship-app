import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import App from '/App'
import { Button as MockButton } from 'react-native'

const mockSpy = jest.fn()
jest.mock('@react-navigation/native', () => ({}))
jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: jest.fn()
}))
/* eslint-disable react/display-name */
jest.mock('rn-flipper-async-storage-advanced', () => () => (
  <div data-testid="async-storage-advanced" />
))
jest.mock('rn-async-storage-flipper', () => () => <div data-testid="flipper" />)
jest.mock('./libs/RootNavigation.js', () => {})
jest.mock('./libs/httpserver/httpServerProvider', () => ({
  HttpServerProvider: ({ children }) => (
    <div data-testid="HttpServerProvider">{children}</div>
  )
}))
jest.mock('./screens/home/HomeScreen', () => () => (
  <div data-testid="HomeScreen" />
))
jest.mock('./screens/cozy-app/CozyAppScreen', () => () => (
  <div data-testid="CozyAppScreen" />
))
jest.mock('./components/webviews/CryptoWebView/CryptoWebView', () => ({
  CryptoWebView: ({ setHasCrypto }) => {
    return (
      <MockButton
        title="title"
        testID="CryptoWebView"
        onClick={() => setHasCrypto(true)}
      />
    )
  }
}))
jest.mock('./Sentry', () => ({ withSentry: x => x }))
/* eslint-enable react/display-name */

jest.mock('react-native-webview', () => {
  const React = require('react') // eslint-disable-line no-shadow
  class WebView extends React.Component {
    postMessage(payload) {
      mockSpy(payload)
    }
    render() {
      return <div>WebView</div>
    }
  }
  return { WebView }
})

describe('App', () => {
  it('should contain AsyncStorage, CryptoWebView, HttpServer, ...', () => {
    // Given
    const { toJSON, getByTestId } = render(<App />)
    const button = getByTestId('CryptoWebView')

    // When
    fireEvent.press(button) // fire hasCrypto

    // Then
    expect(toJSON()).toMatchSnapshot()
  })
})
