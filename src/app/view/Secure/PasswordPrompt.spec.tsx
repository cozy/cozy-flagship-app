import { render, fireEvent } from '@testing-library/react-native'
import '@testing-library/jest-native/extend-expect'
import React from 'react'

import { PasswordPrompt } from '/app/view/Secure/PasswordPrompt'
import { routes } from '/constants/routes'
import { navigate } from '/libs/RootNavigation'
import { translation } from '/locales'

// Mock the navigation and logging dependencies
jest.mock('/libs/RootNavigation', () => ({
  ...jest.requireActual('/libs/RootNavigation'),
  navigate: jest.fn()
}))

jest.mock('/core/tools/env', () => ({
  devlog: jest.fn()
}))

// This suite tests the PasswordPrompt component
describe('PasswordPrompt', () => {
  // This test ensures that the handleSetPassword function
  // correctly navigates to the setPassword route when pressed
  it('handleSetPassword navigates to setPassword route', () => {
    const onSuccess = jest.fn()

    const { getByText } = render(
      <PasswordPrompt
        route={{ params: { onSuccess }, key: '', name: 'pinPrompt' }}
      />
    )

    fireEvent.press(
      getByText(translation.screens.SecureScreen.passwordprompt_cta)
    )

    // The onSuccess prop should be passed through to the setPassword route
    expect(navigate).toHaveBeenCalledWith(routes.setPassword, { onSuccess })
  })

  // This test ensures that the handleSetPassword function
  // correctly handles errors and navigates to the setPassword route
  // with a home redirect when an error occurs
  it('handleSetPassword navigates to setPassword with home redirect on error', () => {
    // Mock a failing onSuccess function
    const onSuccess = jest.fn().mockImplementation(() => {
      throw new Error('No onSuccess callback given to PinPrompt')
    })

    const { getByText } = render(
      <PasswordPrompt
        route={{ params: { onSuccess }, key: '', name: 'pinPrompt' }}
      />
    )

    fireEvent.press(
      getByText(translation.screens.SecureScreen.passwordprompt_cta)
    )

    // In case of an error, the setPassword route should be called with a new function
    // that redirects to the home route
    expect(navigate).toHaveBeenCalledWith(routes.setPassword, {
      onSuccess: expect.any(Function) as () => void
    })
  })
})
