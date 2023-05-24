import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'

import { SetPinView } from '/app/view/Secure/SetPinView'

jest.mock('/app/domain/authorization/services/SecurityService', () => ({
  savePinCode: jest.fn(),
  doPinCodeAutoLock: jest.fn()
}))

jest.mock('/locales', () => ({
  translation: {
    screens: {
      SecureScreen: {
        confirm_pin_error: 'Error message'
      },
      lock: {
        pin_label: 'PIN'
      }
    }
  }
}))

describe('SetPinView', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<SetPinView onSuccess={jest.fn()} />)
    expect(getByTestId('pin-input')).toBeTruthy()
  })

  it('advances to the next step when the Next button is pressed', () => {
    const { getByTestId } = render(<SetPinView onSuccess={jest.fn()} />)

    fireEvent.changeText(getByTestId('pin-input'), '1234')
    fireEvent.press(getByTestId('pin-next'))

    expect(getByTestId('pin-confirm-input')).toBeTruthy()
  })
})
