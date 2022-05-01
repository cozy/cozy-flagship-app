import NetInfo from '@react-native-community/netinfo'

import strings from '../../strings.json'
import { NetService, _netInfoChangeHandler } from './NetService'
import { routes } from '../../constants/routes'

const mockReset = jest.fn()

jest.mock('../RootNavigation', () => ({
  reset: (...args) => mockReset(...args)
}))

afterEach(() => {
  jest.clearAllMocks()
})

it('handles isConnected', async () => {
  NetInfo.fetch.mockReturnValue({ isConnected: true })

  expect(await NetService.isConnected()).toBe(true)
})

it('handles isConnected false', async () => {
  NetInfo.fetch.mockReturnValue({ isConnected: false })

  expect(await NetService.isConnected()).toBe(false)
})

it('handles isOffline', async () => {
  NetInfo.fetch.mockReturnValue({ isConnected: false })

  expect(await NetService.isOffline()).toBe(true)
})

it('handles isOffline false', async () => {
  NetInfo.fetch.mockReturnValue({ isConnected: true })

  expect(await NetService.isOffline()).toBe(false)
})

it('handles offline redirection', async () => {
  NetInfo.fetch.mockReturnValue({ isConnected: false })

  await NetService.handleOffline()

  expect(mockReset).toHaveBeenNthCalledWith(1, routes.error, {
    type: strings.errorScreens.offline
  })
})

it('handle toggleNetWatcher', () => {
  const cleanup = NetInfo.addEventListener

  NetService.toggleNetWatcher()
  NetService.toggleNetWatcher()
  NetService.toggleNetWatcher()
  NetService.toggleNetWatcher(true)
  NetService.toggleNetWatcher()
  NetService.toggleNetWatcher()
  NetService.toggleNetWatcher()
  NetService.toggleNetWatcher()
  NetService.toggleNetWatcher(true)

  expect(NetInfo.addEventListener).toHaveBeenCalledTimes(2)
  expect(cleanup).toHaveBeenCalledTimes(2)
})

it('handles state callback', () => {
  _netInfoChangeHandler({ isConnected: true })

  expect(mockReset).toHaveBeenNthCalledWith(1, routes.stack)
})

it('handles state callback on offline', () => {
  _netInfoChangeHandler({ isConnected: false })

  expect(mockReset).not.toHaveBeenCalled()
})

it('handles state callback on error', () => {
  const brokenState = undefined
  _netInfoChangeHandler(brokenState)

  expect(mockReset).not.toHaveBeenCalled()
})
