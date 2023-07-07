import { EventEmitter } from 'events'

import {
  screen,
  render,
  fireEvent,
  act,
  waitFor
} from '@testing-library/react-native'
import React from 'react'

import type CozyClient from 'cozy-client'
const mockAsyncLogout = jest.fn().mockResolvedValue(undefined)

jest.mock('/libs/intents/localMethods', () => {
  return {
    asyncLogout: mockAsyncLogout
  }
})

import {
  AuthService,
  startListening
} from '/app/domain/authentication/services/AuthService'
import { useRevokedStatus } from '/app/view/Auth/useRevokedStatus'
import { ErrorTokenModal } from '/app/view/Auth/ErrorTokenModal'
import { translation } from '/locales'

const TestComponent = (): JSX.Element | null => {
  const { userRevoked, userConfirmation } = useRevokedStatus(AuthService)

  return userRevoked ? <ErrorTokenModal onClose={userConfirmation} /> : null
}

jest.mock('cozy-client', () => ({
  on: jest.fn()
}))

/**
 * When `AuthService` starts listening, it properly attaches an event listener to the `cozy-client` instance.
 * When the `revoked` event is triggered on `cozy-client`, `AuthService` handles this correctly by setting `userRevoked` to `true` and emitting the `userRevoked` event.
 *`useRevokedStatus` hook properly listens for events emitted by `AuthService`, and updates its state accordingly.
 * ErrorTokenModal` shows and hides correctly according to the `userRevoked` state.
 */
describe('Handling revoked user', () => {
  const clientMock = new EventEmitter() as unknown as CozyClient

  beforeAll(() => {
    jest.resetAllMocks()
    AuthService.setUserRevoked(false)
    startListening(clientMock)
  })

  it('updates revoked status correctly in useRevokedStatus hook', async () => {
    render(<TestComponent />)

    // Initial state, user is not revoked, no modal
    expect(screen.queryByText(translation.modals.ErrorToken.body)).toBeNull()

    // Cozy client emits revoked event
    act(() => {
      clientMock.emit('revoked')
    })

    // AuthService updates its state and emits userRevoked event
    // The view should update accordingly thanks to the hook
    expect(
      screen.queryByText(translation.modals.ErrorToken.body)
    ).not.toBeNull()

    // User confirms the revoked modal by closing it
    act(() => {
      fireEvent.press(screen.getByText(translation.modals.ErrorToken.button))
    })

    // The user should be logged out
    expect(mockAsyncLogout).toHaveBeenCalledTimes(1)

    // The modal should be closed
    await waitFor(() => {
      expect(screen.queryByText(translation.modals.ErrorToken.body)).toBeNull()
    })
  })
})
