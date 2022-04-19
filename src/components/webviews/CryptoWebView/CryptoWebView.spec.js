import { CryptoWebView } from './CryptoWebView'
import React from 'react'
import { render } from '@testing-library/react-native'
import {
  sendAnswer,
  subscribeToCrypto,
  unsubscribeFromCrypto
} from './cryptoObservable/cryptoObservable'

jest.mock('./cryptoObservable/cryptoObservable', () => ({
  sendAnswer: jest.fn(),
  subscribeToCrypto: jest.fn(),
  unsubscribeFromCrypto: jest.fn()
}))

jest.mock('react-native-webview', () => {
  const React = require('react')
  class WebView extends React.Component {
    postMessage(payload) {
      this.props.onMessage({
        nativeEvent: {
          data: JSON.stringify({
            answer: 'SOME_ANSWER',
            payloadRefForTests: JSON.parse(payload)
          })
        }
      })
    }
    render() {
      return <div>WebView</div>
    }
  }
  return { WebView }
})

describe('CryptoWebview', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should render', () => {
    // When
    const { toJSON } = render(<CryptoWebView />)
    // Then
    expect(toJSON()).toMatchSnapshot()
  })

  it('should subscribeToCrypto on mount', () => {
    // When
    render(<CryptoWebView />)
    // Then
    expect(subscribeToCrypto).toHaveBeenCalledWith(expect.any(Function))
  })

  it('should unsubscribeFromCrypto on unmount', () => {
    // Given
    const { unmount } = render(<CryptoWebView />)

    // When
    unmount()

    // Then
    expect(unsubscribeFromCrypto).toHaveBeenCalledWith(expect.any(Function))
  })

  it('should sendAnswer with expected answer from WebView', () => {
    let cbPointer
    const message = 'MESSAGE'
    const messageId = 'MESSAGEID'
    const param = { param: 'PARAM' }
    subscribeToCrypto.mockImplementation(cb => {
      cbPointer = cb
    })

    render(<CryptoWebView />)

    cbPointer(message, messageId, param)

    expect(sendAnswer).toHaveBeenCalledWith({
      answer: 'SOME_ANSWER',
      payloadRefForTests: {
        message: 'MESSAGE',
        messageId: 'MESSAGEID',
        param: { param: 'PARAM' }
      }
    })
  })
})
