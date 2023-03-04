import { fireEvent, render, waitFor } from '@testing-library/react-native'
import React from 'react'
import { act } from 'react-dom/test-utils'
import { Button as MockButton } from 'react-native'

import { ClouderyView } from './ClouderyView'

const mockGetNextUrl = jest.fn()

jest.mock('cozy-client', () => ({
  rootCozyUrl: jest.fn(),
  useClient: jest.fn().mockReturnValue({})
}))

jest.mock('@react-native-cookies/cookies', () => ({
  set: jest.fn()
}))

jest.mock('react-native-webview', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const React = require('react')
  class WebView extends React.Component {
    render() {
      return (
        <>
          <MockButton
            testID="triggerStartLoadWithRequest"
            onPress={() => {
              const request = {
                loading: true,
                url: mockGetNextUrl()
              }
              this.props.onShouldStartLoadWithRequest(request)
            }}
            title="WebView Button"
          />
          <MockButton
            testID="triggerOnLoadEnd"
            onPress={() => {
              this.props.onLoadEnd()
            }}
            title="WebView Button onLoadEnd"
          />
        </>
      )
    }
  }

  return { WebView }
})

describe('ClouderyView', () => {
  describe('on handleNavigation', () => {
    const props = {
      setInstanceData: jest.fn()
    }

    afterAll(() => {
      // Then
      expect(props.setInstanceData).toHaveBeenCalledTimes(1)
      expect(props.setInstanceData).toHaveBeenCalledWith({
        instance: 'https://someinstance.mycozy.cloud/',
        fqdn: 'someinstance.mycozy.cloud'
      })
    })

    it('should convert instance and FQDN to lowercase', () => {
      const { getByTestId } = render(<ClouderyView {...props} />)

      const button = getByTestId('triggerStartLoadWithRequest')

      mockGetNextUrl.mockReturnValueOnce(
        'https://loginflagship?fqdn=SOMEINSTANCE.MYCOZY.CLOUD'
      )

      fireEvent.press(button)
    })
  })

  it('should display overlay over webview while loading', () => {
    // When
    const { queryByTestId } = render(<ClouderyView />)

    // Then
    expect(queryByTestId('overlay')).toBeTruthy()
  })

  it('should hide overlay 1 ms after loading is finished', done => {
    // Given
    const { getByTestId, queryByTestId } = render(<ClouderyView />)
    const button = getByTestId('triggerOnLoadEnd')

    act(() => {
      // When
      fireEvent.press(button) // trigger onLoadEnd

      waitFor(() => {
        // Then
        expect(queryByTestId('overlay')).toBeFalsy()
        done()
      })
    })
  })
})
