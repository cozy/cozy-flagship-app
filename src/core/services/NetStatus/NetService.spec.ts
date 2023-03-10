import NetInfo, { NetInfoState } from '@react-native-community/netinfo'

import strings from '/constants/strings.json'

import { NetService } from './NetService'

import { routes } from '../../constants/routes'

const mockReset = jest.fn<jest.Mock, unknown[]>()
const callbackRoute = 'foo'
const mockedNetInfo = NetInfo as jest.Mocked<typeof NetInfo>

const mockedListener = mockedNetInfo.addEventListener as unknown as jest.Mock<
  void,
  never[]
>

const mockedFetch = NetInfo.fetch as jest.Mock

jest.mock('../RootNavigation', () => ({
  reset: (...args: unknown[]): jest.Mock => mockReset(...args)
}))

afterEach(() => {
  jest.clearAllMocks()
})

it('handles isConnected', async () => {
  mockedFetch.mockReturnValue({ isConnected: true })

  expect(await NetService.isConnected()).toBe(true)
})

it('handles isConnected false', async () => {
  mockedFetch.mockReturnValue({ isConnected: false })

  expect(await NetService.isConnected()).toBe(false)
})

it('handles isOffline', async () => {
  mockedFetch.mockReturnValue({ isConnected: false })

  expect(await NetService.isOffline()).toBe(true)
})

it('handles isOffline false', async () => {
  mockedFetch.mockReturnValue({ isConnected: true })

  expect(await NetService.isOffline()).toBe(false)
})

it('handles imperative offline fallback', async () => {
  const timeBeforeReconnect = 500
  const mockUnsubscribe = jest.fn()

  mockedListener.mockImplementation(
    (callback: (state: NetInfoState) => void) => {
      setTimeout(
        () => callback({ isConnected: true } as NetInfoState),
        timeBeforeReconnect
      )

      return mockUnsubscribe
    }
  )

  NetService.handleOffline(callbackRoute)

  await new Promise(resolve => setTimeout(resolve, timeBeforeReconnect))

  expect(mockReset).toHaveBeenNthCalledWith(1, routes.error, {
    type: strings.errorScreens.offline
  })

  expect(mockReset).toHaveBeenNthCalledWith(2, callbackRoute)

  expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
})
