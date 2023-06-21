import { render, fireEvent } from '@testing-library/react-native'
import '@testing-library/jest-native/extend-expect'
import React from 'react'

import { PinPrompt } from '/app/view/Secure/PinPrompt'
import { routes } from '/constants/routes'
import { navigate } from '/libs/RootNavigation'
import { translation } from '/locales'

// @TODO
// We need to mock these core services for the test to work
// This is a problem and a way to decouple the component from such services should be found
jest.mock('/libs/konnectors/sendKonnectorsLogs.ts', () => jest.fn())
jest.mock('/app/domain/authorization/utils/devMode.ts', () => {
  return {
    getDevModeFunctions: jest.fn().mockReturnValue(false)
  }
})
jest.mock('/libs/RootNavigation', () => ({
  ...jest.requireActual('/libs/RootNavigation'),
  navigate: jest.fn()
}))
jest.mock('/core/tools/env', () => ({
  devlog: jest.fn()
}))

// This is our main test suite for the PinPrompt component
describe('PinPrompt', () => {
  // This test verifies that the PinPrompt properly navigates to the setPin route
  // when the "Set Pin Code" button is pressed.
  it('handleSetPinCode navigates to setPin route', () => {
    const onSuccess = jest.fn()

    // We're rendering the component and then simulating a button press
    const { getByText } = render(
      <PinPrompt
        route={{ key: 'pinPrompt', name: 'pinPrompt', params: { onSuccess } }}
      />
    )

    fireEvent.press(getByText(translation.screens.SecureScreen.pinprompt_cta))

    // We're verifying that the navigate function was called with the expected arguments
    expect(navigate).toHaveBeenCalledWith(routes.setPin, { onSuccess })
  })

  // This test verifies that the PinPrompt's "Ignore" button behaves correctly.
  // We're verifying two scenarios:
  // 1. The onSuccess callback was called correctly.
  // 2. The component properly handles an error and navigates to the home screen when an error is thrown in the onSuccess callback.
  it('handleIgnorePinCode behaves correctly', () => {
    const onSuccess = jest.fn()

    const { getByText } = render(
      <PinPrompt
        route={{ key: 'pinPrompt', name: 'pinPrompt', params: { onSuccess } }}
      />
    )

    fireEvent.press(
      getByText(translation.screens.SecureScreen.pinprompt_refusal)
    )

    // Verifying that the onSuccess callback was called correctly.
    expect(onSuccess).toHaveBeenCalled()

    // Now we're simulating an error being thrown in the onSuccess callback,
    // and verifying that the component handles it properly by navigating to the home screen.
    onSuccess.mockImplementation(() => {
      throw new Error('An error occurred in onSuccess callback')
    })

    fireEvent.press(
      getByText(translation.screens.SecureScreen.pinprompt_refusal)
    )

    expect(navigate).toHaveBeenCalledWith(routes.home)
  })
})
