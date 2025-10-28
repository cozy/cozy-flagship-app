import { render, fireEvent } from '@testing-library/react-native'
import React from 'react'

import { showSecurityScreen } from '/app/view/Lock/useLockScreenWrapper'
import { PasswordPrompt } from '/app/view/Secure/PasswordPrompt'

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('/app/view/Lock/useLockScreenWrapper', () => ({
  ...jest.requireActual('/app/view/Lock/useLockScreenWrapper'),
  hideSecurityScreen: jest.fn(),
  showSecurityScreen: jest.fn()
}))

// This suite tests the PasswordPrompt component
describe('PasswordPrompt', () => {
  // This test ensures that the handleSetPassword function
  // correctly navigates to the setPassword route when pressed
  it('handleSetPassword navigates to setPassword route', () => {
    const { getByText } = render(<PasswordPrompt />)

    fireEvent.press(getByText('screens.SecureScreen.passwordprompt_cta'))

    // The onSuccess prop should be passed through to the setPassword route
    expect(showSecurityScreen).toHaveBeenCalledWith('SET_PASSWORD')
  })
})
