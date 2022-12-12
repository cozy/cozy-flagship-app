import NetInfo, { NetInfoState } from '@react-native-community/netinfo'
import React from 'react'
import { Text } from 'react-native'
import { render, screen } from '@testing-library/react-native'

import NetStatusBoundary from '/libs/services/NetStatusBoundary'

jest.mock('@react-native-cookies/cookies', () => ({
  clearAll: jest.fn()
}))

jest.mock('cozy-client', () => ({
  useClient: jest.fn()
}))

const mockedNetInfo = NetInfo as jest.Mocked<typeof NetInfo>

const mockedListener = mockedNetInfo.addEventListener as unknown as jest.Mock<
  void,
  never[]
>

it('should render children when connected', async () => {
  mockedNetInfo.fetch.mockResolvedValue({ isConnected: true } as NetInfoState)

  render(
    <NetStatusBoundary>
      <Text>children</Text>
    </NetStatusBoundary>
  )

  expect(await screen.findByText('children')).toBeTruthy()
})

it('should render error screen when not connected', async () => {
  mockedNetInfo.fetch.mockResolvedValue({ isConnected: false } as NetInfoState)

  render(
    <NetStatusBoundary offlineScreen={<Text>offline</Text>}>
      <Text>children</Text>
    </NetStatusBoundary>
  )

  expect(await screen.findByText('offline')).toBeTruthy()
})

it('should render children when connected after being disconnected', async () => {
  mockedNetInfo.fetch.mockResolvedValue({ isConnected: false } as NetInfoState)

  mockedListener.mockImplementation((callback: (state: NetInfoState) => void) =>
    setTimeout(() => callback({ isConnected: true } as NetInfoState), 500)
  )

  render(
    <NetStatusBoundary>
      <Text>children</Text>
    </NetStatusBoundary>
  )

  expect(await screen.findByText('children')).toBeTruthy()
})

it('should not render offlineScreen when disconnected after being connected', async () => {
  mockedNetInfo.fetch.mockResolvedValue({ isConnected: true } as NetInfoState)

  mockedListener.mockImplementation((callback: (state: NetInfoState) => void) =>
    setTimeout(() => callback({ isConnected: false } as NetInfoState), 500)
  )

  render(
    <NetStatusBoundary offlineScreen={<Text>offline</Text>}>
      <Text>children</Text>
    </NetStatusBoundary>
  )

  expect(await screen.findByText('children')).toBeTruthy()
})
