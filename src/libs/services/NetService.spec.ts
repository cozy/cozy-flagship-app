import NetInfo from '@react-native-community/netinfo'

import strings from '/strings.json'
import { NetService, _netInfoChangeHandler } from './NetService'
import { routes } from '/constants/routes'

const mockReset = jest.fn()
const callbackRoute = 'foo'

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

  NetService.handleOffline()

  expect(mockReset).toHaveBeenNthCalledWith(1, routes.error, {
    type: strings.errorScreens.offline
  })
})

it('handle toggleNetWatcher', () => {
  const cleanup = NetInfo.addEventListener

  NetService.toggleNetWatcher()
  NetService.toggleNetWatcher()
  NetService.toggleNetWatcher()
  NetService.toggleNetWatcher({ shouldUnsub: true })
  NetService.toggleNetWatcher()
  NetService.toggleNetWatcher()
  NetService.toggleNetWatcher()
  NetService.toggleNetWatcher()
  NetService.toggleNetWatcher({ shouldUnsub: true })

  expect(NetInfo.addEventListener).toHaveBeenNthCalledWith(
    2,
    expect.any(Function)
  )
  expect(cleanup).toHaveBeenNthCalledWith(2, expect.any(Function))
})

it('handle toggleNetWatcher with route', () => {
  const cleanup = NetInfo.addEventListener

  NetService.toggleNetWatcher({ callbackRoute })
  NetService.toggleNetWatcher({ callbackRoute })
  NetService.toggleNetWatcher({ callbackRoute })
  NetService.toggleNetWatcher({ shouldUnsub: true, callbackRoute })
  NetService.toggleNetWatcher({ callbackRoute })
  NetService.toggleNetWatcher({ callbackRoute })
  NetService.toggleNetWatcher({ callbackRoute })
  NetService.toggleNetWatcher({ callbackRoute })
  NetService.toggleNetWatcher({ shouldUnsub: true, callbackRoute })

  expect(NetInfo.addEventListener).toHaveBeenNthCalledWith(
    2,
    expect.any(Function)
  )
  expect(cleanup).toHaveBeenNthCalledWith(2, expect.any(Function))
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

it('handles state callback with route', () => {
  _netInfoChangeHandler({ isConnected: true }, callbackRoute)

  expect(mockReset).toHaveBeenNthCalledWith(1, callbackRoute)
})

it('handles state callback on offline with route', () => {
  _netInfoChangeHandler({ isConnected: false }, callbackRoute)

  expect(mockReset).not.toHaveBeenCalled()
})

it('handles state callback on error with route', () => {
  const brokenState = undefined
  _netInfoChangeHandler(brokenState, callbackRoute)

  expect(mockReset).not.toHaveBeenCalled()
})
