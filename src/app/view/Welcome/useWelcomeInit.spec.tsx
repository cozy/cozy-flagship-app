import { fireEvent, render, screen } from '@testing-library/react-native'
import React, { useState } from 'react'
import { Button } from 'react-native'

jest.mock('/locales/i18n', () => {
  return {
    changeLanguageToPhoneLocale: jest.fn().mockResolvedValue(undefined)
  }
})

import { useWelcomeInit } from '/app/view/Welcome/useWelcomeInit'
import { changeLanguageToPhoneLocale } from '/locales/i18n'

const mockChangeLanguageToPhoneLocale = changeLanguageToPhoneLocale as jest.Mock

const Welcome = (): JSX.Element => {
  const [count, setCount] = useState(0)
  useWelcomeInit()
  const handleClick = (): void => setCount(count + 1)
  return <Button title="button" onPress={handleClick} testID="button" />
}

describe('useWelcomeInit', () => {
  beforeEach(() => {
    mockChangeLanguageToPhoneLocale.mockClear()
  })

  it('calls changeLanguageToPhoneLocale on first render only', () => {
    render(<Welcome />)

    // Force re-renders by clicking the button
    for (let i = 0; i < 3; i++) fireEvent.press(screen.getByTestId('button'))

    expect(mockChangeLanguageToPhoneLocale).toHaveBeenCalledTimes(1)
  })
})
