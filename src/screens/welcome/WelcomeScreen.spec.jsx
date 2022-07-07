import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { navigate } from '/libs/RootNavigation'
import { routes } from '/constants/routes'
import { WelcomeScreen } from '/screens/welcome/WelcomeScreen'
import { Button as MockButton } from 'react-native'

jest.mock('/libs/RootNavigation')
jest.mock('/libs/functions/makeHandlers', () => ({
  makeHandlers: handlers => () => {
    handlers.onContinue()
    return 'done'
  }
}))
jest.mock('/hooks/useSplashScreen', () => ({
  useSplashScreen: () => ({})
}))
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({})
}))
jest.mock()

const mockSpy = jest.fn()

jest.mock('react-native-webview', () => {
  const React = require('react') // eslint-disable-line no-shadow
  class WebView extends React.Component {
    postMessage(payload) {
      mockSpy(payload)
    }
    render() {
      return (
        <div>
          WebView
          <MockButton
            testID="button"
            onPress={() => {
              this.props.onMessage()
            }}
            title="WebView Button onMessage"
          />
        </div>
      )
    }
  }
  return WebView
})

describe('WelcomeScreen', () => {
  it('should display welcome modal first', () => {
    // When
    const { getByTestId } = render(<WelcomeScreen />)

    const button = getByTestId('button')
    fireEvent.press(button)

    // Then
    expect(navigate).toHaveBeenCalledWith(routes.stack)
  })
})
