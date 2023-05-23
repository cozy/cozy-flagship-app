import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'

import { SetPinView } from '/app/view/Secure/SetPinView'

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: (): {
    top: number
    bottom: number
    left: number
    right: number
  } => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  useSafeAreaFrame: (): {
    x: number
    y: number
    width: number
    height: number
  } => ({ x: 0, y: 0, width: 0, height: 0 })
}))

jest.mock('/app/domain/authorization/services/SecurityService', () => ({
  savePinCode: jest.fn(),
  startPinCode: jest.fn()
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
