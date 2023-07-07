import EventEmitter from 'events'

import { act, fireEvent, render, screen } from '@testing-library/react-native'
import React from 'react'
import { Text } from 'react-native'

import { ErrorTokenModal } from '/app/view/Auth/ErrorTokenModal'
import { useRevokedStatus } from '/app/view/Auth/useRevokedStatus'
import { translation } from '/locales'
import { AuthService } from '/app/domain/authentication/services/AuthService'

// Mock functions
const eventEmitter = new EventEmitter()
let userRevokedStatus = false
type MockService = typeof AuthService

const mockService: MockService = {
  isUserRevoked: jest.fn(() => userRevokedStatus),
  setUserRevoked: jest.fn((status: boolean) => {
    userRevokedStatus = status
    status
      ? eventEmitter.emit('userRevoked', status)
      : eventEmitter.emit('userLoggedOut', status)
  }),
  startListening: jest.fn(),
  emitter: eventEmitter
}

const mockIsUserRevoked = mockService.isUserRevoked as jest.Mock

// Stub Component using the hook
const ComponentUsingHook = ({
  authService
}: {
  authService: MockService
}): JSX.Element => {
  const { userRevoked, userConfirmation } = useRevokedStatus(authService)

  return userRevoked ? (
    <ErrorTokenModal onClose={userConfirmation} />
  ) : (
    <Text>All fine</Text>
  )
}

describe('ErrorTokenModal and useRevokedStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders ErrorTokenModal when revoked status is true', () => {
    mockIsUserRevoked.mockReturnValue(true)

    render(<ComponentUsingHook authService={mockService} />)

    screen.getByText(translation.modals.ErrorToken.title)
  })

  it('does not ErrorTokenModal when revoked status is true', () => {
    mockIsUserRevoked.mockReturnValue(false)

    render(<ComponentUsingHook authService={mockService} />)

    screen.getByText('All fine')
  })

  it('changes from "Trigger Error" to "All fine" when button is pressed', () => {
    mockIsUserRevoked.mockReturnValueOnce(true)

    render(<ComponentUsingHook authService={mockService} />)

    screen.getByText(translation.modals.ErrorToken.button)

    act(() =>
      fireEvent.press(screen.getByText(translation.modals.ErrorToken.button))
    )

    screen.getByText('All fine')
  })
})
