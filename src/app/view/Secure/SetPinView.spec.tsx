import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'

import { SetPinView } from '/app/view/Secure/SetPinView'

jest.mock('/app/domain/authorization/services/SecurityService', () => ({
  savePinCode: jest.fn(),
  doPinCodeAutoLock: jest.fn()
}))

describe('SetPinView', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<SetPinView />)
    expect(getByTestId('pin-input')).toBeTruthy()
  })

  it('advances to the next step when the Next button is pressed', () => {
    const { getByTestId } = render(<SetPinView />)

    fireEvent.changeText(getByTestId('pin-input'), '1234')
    fireEvent.press(getByTestId('pin-next'))

    expect(getByTestId('pin-confirm-input')).toBeTruthy()
  })
})
