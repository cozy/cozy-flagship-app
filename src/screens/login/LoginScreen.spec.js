import { render } from '@testing-library/react-native'
import { LoginScreen } from '/screens/login/LoginScreen'
import React from 'react'
import { navigate } from '/libs/RootNavigation'
import { routes } from '/constants/routes'

jest.mock('/libs/RootNavigation')
jest.mock('/hooks/useSplashScreen', () => ({
  useSplashScreen: () => ({})
}))
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({})
}))

describe('LoginScreen', () => {
  it('should display welcome modal first', () => {
    // Given
    // eslint-disable-next-line no-console
    console.log = jest.fn()

    // When
    render(<LoginScreen />)

    // Then
    expect(navigate).toHaveBeenCalledWith(routes.welcome)
  })
})
