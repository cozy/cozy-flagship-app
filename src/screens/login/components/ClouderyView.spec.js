import React from 'react'
import { Button as MockButton } from 'react-native'
import { fireEvent, render } from '@testing-library/react-native'

import { ClouderyView } from './ClouderyView'

const mockGetNextUrl = jest.fn()

jest.mock('react-native-webview', () => {
  const React = require('react')
  class WebView extends React.Component {
    render() {
      return (
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
      )
    }
  }
  return { WebView }
})

describe('ClouderyView', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('on handleNavigation', () => {
    it('should convert instance and FQDN to lowercase', async () => {
      // Given
      const props = {
        setInstanceData: jest.fn()
      }

      const { getByTestId } = await render(<ClouderyView {...props} />)

      const button = getByTestId('triggerStartLoadWithRequest')

      // When
      mockGetNextUrl.mockReturnValueOnce(
        'https://loginflagship?fqdn=SOMEINSTANCE.MYCOZY.CLOUD'
      )
      fireEvent.press(button)

      // Then
      expect(props.setInstanceData).toHaveBeenCalledTimes(1)
      expect(props.setInstanceData).toHaveBeenCalledWith({
        instance: 'https://someinstance.mycozy.cloud/',
        fqdn: 'someinstance.mycozy.cloud'
      })
    })
  })
})
