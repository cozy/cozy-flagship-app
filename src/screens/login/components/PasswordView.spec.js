import React from 'react'
import { render } from '@testing-library/react-native'
import { PasswordView } from './PasswordView'

const mockSpy = jest.fn()

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

describe('PasswordView', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should render component with webview and view', () => {
    const props = {
      instance: 'http://cozy.192-168-1-102.nip.io:8080'
    }
    // When
    const { toJSON } = render(<PasswordView {...props} />)

    // Then
    expect(toJSON()).toMatchSnapshot()
  })

  describe('on error message', () => {
    it('should post error message', () => {
      const errorMessage = 'wrong password'
      const props = {
        instance: 'http://cozy.192-168-1-102.nip.io:8080'
      }
      expect(mockSpy).toHaveBeenCalledTimes(0)

      const { update } = render(<PasswordView {...props} />)

      // When
      update(<PasswordView {...props} errorMessage={errorMessage} />)

      // Then
      expect(mockSpy).toHaveBeenCalledTimes(2)
      expect(mockSpy).toHaveBeenCalledWith(
        JSON.stringify({ message: 'setReadonly' })
      )
      expect(mockSpy).toHaveBeenNthCalledWith(
        2,
        JSON.stringify({ message: 'setErrorMessage', param: errorMessage })
      )
    })
  })
})
