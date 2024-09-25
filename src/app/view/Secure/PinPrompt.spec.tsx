import { render, fireEvent } from '@testing-library/react-native'
import '@testing-library/jest-native/extend-expect'
import React from 'react'

import { PinPrompt } from '/app/view/Secure/PinPrompt'
import {
  hideSecurityScreen,
  showSecurityScreen
} from '/app/view/Lock/useLockScreenWrapper'

// @TODO
// We need to mock these core services for the test to work
// This is a problem and a way to decouple the component from such services should be found
jest.mock('/libs/konnectors/sendKonnectorsLogs.ts', () => jest.fn())
jest.mock('/app/domain/authorization/utils/devMode.ts', () => {
  return {
    getDevModeFunctions: jest.fn().mockReturnValue(false)
  }
})
jest.mock('/app/view/Lock/useLockScreenWrapper', () => ({
  ...jest.requireActual('/app/view/Lock/useLockScreenWrapper'),
  hideSecurityScreen: jest.fn(),
  showSecurityScreen: jest.fn()
}))
jest.mock('react-native-file-viewer', () => ({
  open: jest.fn()
}))

// This is our main test suite for the PinPrompt component
describe('PinPrompt', () => {
  // This test verifies that the PinPrompt properly trigger displaying the setPin view
  // when the "Set Pin Code" button is pressed.
  it('handleSetPinCode navigates to setPin route', () => {
    // We're rendering the component and then simulating a button press
    const { getByText } = render(<PinPrompt />)

    fireEvent.press(getByText('screens.SecureScreen.pinprompt_cta'))

    expect(showSecurityScreen).toHaveBeenCalledWith('SET_PIN')
  })

  // This test verifies that the PinPrompt's "Ignore" button correctly hide the pin prompt.
  it('handleIgnorePinCode behaves correctly', () => {
    const { getByText } = render(<PinPrompt />)

    fireEvent.press(getByText('screens.SecureScreen.pinprompt_refusal'))

    // Verifying that the onSuccess callback was called correctly.
    expect(hideSecurityScreen).toHaveBeenCalledWith('PIN_PROMPT')
  })
})
