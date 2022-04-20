import { Linking } from 'react-native'
import { act, renderHook } from '@testing-library/react-hooks'

import { getClient } from '../libs/client'
import { navigate } from '../libs/RootNavigation'
import { routes } from '../constants/routes'
import { useAppBootstrap } from './useAppBootstrap'

const mockHideSplashScreen = jest.fn()
const mockRemove = jest.fn()
const mockClient = 'mockClient'
const initialURL = 'initialURL'
const homeLink = `https://links.mycozy.cloud/home/folder/1?fallback=${initialURL}`
const appLink = `https://links.mycozy.cloud/drive/folder/1?fallback=${initialURL}`
const invalidLink = 'https://foo.com'

jest.mock('../Sentry', () => ({
  SentryTags: {},
  setSentryTag: jest.fn()
}))

jest.mock('../libs/RootNavigation.js', () => ({
  navigate: jest.fn()
}))

jest.mock('./useSplashScreen', () => ({
  useSplashScreen: () => ({ hideSplashScreen: mockHideSplashScreen })
}))

jest.mock('../libs/client', () => ({
  getClient: jest.fn().mockResolvedValue(undefined)
}))

jest.mock('react-native', () => {
  const listeners = []

  return {
    Linking: {
      addEventListener: jest.fn((event, handler) => {
        listeners.push({ event, handler })

        return { remove: mockRemove }
      }),
      emit: jest.fn((event, props) => {
        listeners.filter(l => l.event === event).forEach(l => l.handler(props))
      }),
      getInitialURL: jest.fn().mockResolvedValue(null)
    }
  }
})

afterEach(() => {
  Linking.getInitialURL.mockRestore()
  mockHideSplashScreen.mockClear()
  navigate.mockClear()
  expect(mockRemove).toHaveBeenCalledTimes(1)
})

it('Should handle NO client NO initial URL', async () => {
  const { result, waitForValueToChange } = renderHook(() => useAppBootstrap())

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: undefined,
    initialScreen: {
      stack: routes.authenticate,
      root: routes.stack
    },
    initialRoute: {
      stack: undefined,
      root: undefined
    },
    isLoading: false,
    setClient: expect.anything()
  })

  expect(mockHideSplashScreen).toHaveBeenCalledTimes(1)
})

it('Should handle NO client WITH initial URL as HOME', async () => {
  Linking.getInitialURL.mockResolvedValueOnce(homeLink)

  const { result, waitForValueToChange } = renderHook(() => useAppBootstrap())

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: undefined,
    initialScreen: {
      stack: routes.authenticate,
      root: routes.stack
    },
    initialRoute: {
      stack: undefined,
      root: undefined
    },
    isLoading: false,
    setClient: expect.anything()
  })
})

it('Should handle NO client WITH initial URL as APP', async () => {
  Linking.getInitialURL.mockResolvedValueOnce(appLink)

  const { result, waitForValueToChange } = renderHook(() => useAppBootstrap())

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: undefined,
    initialScreen: {
      stack: routes.authenticate,
      root: routes.stack
    },
    initialRoute: {
      stack: undefined,
      root: undefined
    },
    isLoading: false,
    setClient: expect.anything()
  })

  expect(mockHideSplashScreen).toHaveBeenCalledTimes(1)
})

it('Should handle NO client WITH initial URL as INVALID', async () => {
  Linking.getInitialURL.mockResolvedValueOnce(invalidLink)

  const { result, waitForValueToChange } = renderHook(() => useAppBootstrap())

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: undefined,
    initialScreen: {
      stack: routes.authenticate,
      root: routes.stack
    },
    initialRoute: {
      stack: undefined,
      root: undefined
    },
    isLoading: false,
    setClient: expect.anything()
  })

  expect(mockHideSplashScreen).toHaveBeenCalledTimes(1)
})

it('Should handle WITH client NO initial URL', async () => {
  getClient.mockResolvedValueOnce(mockClient)

  const { result, waitForValueToChange } = renderHook(() => useAppBootstrap())

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: mockClient,
    initialScreen: {
      stack: routes.home,
      root: routes.stack
    },
    initialRoute: {
      stack: undefined,
      root: undefined
    },
    isLoading: false,
    setClient: expect.anything()
  })
})

it('Should handle WITH client WITH initial URL as HOME', async () => {
  Linking.getInitialURL.mockResolvedValueOnce(homeLink)
  getClient.mockResolvedValueOnce(mockClient)

  const { result, waitForValueToChange } = renderHook(() => useAppBootstrap())

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: mockClient,
    initialScreen: {
      stack: routes.home,
      root: routes.stack
    },
    initialRoute: {
      stack: initialURL,
      root: undefined
    },
    isLoading: false,
    setClient: expect.anything()
  })
})

it('Should handle WITH client WITH initial URL as APP LINK', async () => {
  Linking.getInitialURL.mockResolvedValueOnce(appLink)
  getClient.mockResolvedValueOnce(mockClient)

  const { result, waitForValueToChange } = renderHook(() => useAppBootstrap())

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: mockClient,
    initialScreen: {
      stack: routes.home,
      root: routes.cozyapp
    },
    initialRoute: {
      stack: undefined,
      root: initialURL
    },
    isLoading: false,
    setClient: expect.anything()
  })
})

it('Should handle WITH client WITH initial URL as INVALID', async () => {
  Linking.getInitialURL.mockResolvedValueOnce(invalidLink)
  getClient.mockResolvedValueOnce(mockClient)

  const { result, waitForValueToChange } = renderHook(() => useAppBootstrap())

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: mockClient,
    initialScreen: {
      stack: routes.home,
      root: routes.stack
    },
    initialRoute: {
      stack: undefined,
      root: undefined
    },
    isLoading: false,
    setClient: expect.anything()
  })
})

it('Should handle WITH lifecycle URL as HOME', async () => {
  getClient.mockResolvedValueOnce(mockClient)

  const { result, waitForValueToChange } = renderHook(() => useAppBootstrap())

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: mockClient,
    initialScreen: {
      stack: routes.home,
      root: routes.stack
    },
    initialRoute: {
      stack: undefined,
      root: undefined
    },
    isLoading: false,
    setClient: expect.anything()
  })

  act(() => {
    Linking.emit('url', { url: homeLink })
  })

  expect(navigate).toHaveBeenNthCalledWith(1, routes.home, { href: initialURL })
})

it('Should handle WITH lifecycle URL as APP LINK', async () => {
  getClient.mockResolvedValueOnce(mockClient)

  const { result, waitForValueToChange } = renderHook(() => useAppBootstrap())

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: mockClient,
    initialScreen: {
      stack: routes.home,
      root: routes.stack
    },
    initialRoute: {
      stack: undefined,
      root: undefined
    },
    isLoading: false,
    setClient: expect.anything()
  })

  act(() => {
    Linking.emit('url', { url: appLink })
  })

  expect(navigate).toHaveBeenNthCalledWith(1, routes.cozyapp, {
    href: initialURL
  })
})

it('Should handle WITH lifecycle URL as INVALID', async () => {
  getClient.mockResolvedValueOnce(mockClient)

  const { result, waitForValueToChange } = renderHook(() => useAppBootstrap())

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: mockClient,
    initialScreen: {
      stack: routes.home,
      root: routes.stack
    },
    initialRoute: {
      stack: undefined,
      root: undefined
    },
    isLoading: false,
    setClient: expect.anything()
  })

  act(() => {
    Linking.emit('url', { url: invalidLink })
  })

  expect(navigate).not.toHaveBeenCalled()
})
