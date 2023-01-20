import { Linking } from 'react-native'
import { act, renderHook } from '@testing-library/react-hooks'

import { navigate } from '/libs/RootNavigation'
import { routes } from '/constants/routes'
import { useAppBootstrap } from '/hooks/useAppBootstrap'

const mockHideSplashScreen = jest.fn()
const mockRemove = jest.fn()
const mockClient = {
  getStackClient: jest.fn().mockReturnValue({ fetchJSON: jest.fn() })
}
const initialURL = 'initialURL'
const homeLink = `https://links.mycozy.cloud/home/folder/1?fallback=${initialURL}`
const appLink = `https://links.mycozy.cloud/drive/folder/1?fallback=${initialURL}`
const invalidLink = 'https://foo.com'

jest.mock('../libs/client', () => ({
  clearClient: jest.fn()
}))

jest.mock('react-native-bootsplash', () => ({
  show: jest.fn()
}))

jest.mock('/libs/monitoring/Sentry', () => ({
  SentryCustomTags: {},
  setSentryTag: jest.fn()
}))

jest.mock('/libs/RootNavigation.js', () => ({
  navigate: jest.fn()
}))

jest.mock('./useSplashScreen', () => ({
  useSplashScreen: () => ({ hideSplashScreen: mockHideSplashScreen })
}))

jest.mock('react-native', () => {
  const listeners = []

  return {
    LogBox: {
      ignoreAllLogs: jest.fn()
    },
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
  expect(mockRemove).toHaveBeenCalledTimes(1)
})

it('should set routes.stack and instance creation - when onboard_url provided', async () => {
  // Given
  const paramOnboardUrl = 'param-onboard-url'
  const onboardingUrl = `http://localhost:8080/onboarding-url?onboard_url=${paramOnboardUrl}&fqdn=param-fqdn`
  Linking.getInitialURL.mockResolvedValueOnce(onboardingUrl)

  const { result, waitForValueToChange } = renderHook(() => useAppBootstrap())

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: undefined,
    initialScreen: {
      params: {
        onboardUrl: paramOnboardUrl
      },
      stack: routes.instanceCreation,
      root: routes.stack
    },
    initialRoute: {
      stack: undefined,
      root: undefined
    },
    isLoading: false
  })

  expect(mockHideSplashScreen).toHaveBeenCalledTimes(1)
})

it('should set routes.stack and authenticate - when onboard_url not provided', async () => {
  // Given
  const paramFqdn = `param-fqdn`
  const onboardingUrl = `http://localhost:8080/onboarding-url?fqdn=${paramFqdn}`
  Linking.getInitialURL.mockResolvedValueOnce(onboardingUrl)

  const { result, waitForValueToChange } = renderHook(() => useAppBootstrap())

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: undefined,
    initialScreen: {
      stack: routes.authenticate,
      root: routes.stack,
      params: {
        fqdn: paramFqdn
      }
    },
    initialRoute: {
      stack: undefined,
      root: undefined
    },
    isLoading: false
  })

  expect(mockHideSplashScreen).toHaveBeenCalledTimes(1)
})

it('Should handle welcome page', async () => {
  const { result, waitForValueToChange } = renderHook(() => useAppBootstrap())

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: undefined,
    initialScreen: {
      stack: routes.welcome,
      root: routes.stack
    },
    initialRoute: {
      stack: undefined,
      root: undefined
    },
    isLoading: false
  })

  expect(mockHideSplashScreen).toHaveBeenCalledTimes(1)
})

it('Should handle NO client NO initial URL', async () => {
  const { result, waitForValueToChange } = renderHook(() => useAppBootstrap())

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: undefined,
    initialScreen: {
      stack: routes.welcome,
      root: routes.stack
    },
    initialRoute: {
      stack: undefined,
      root: undefined
    },
    isLoading: false
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
      stack: routes.welcome,
      root: routes.stack
    },
    initialRoute: {
      stack: undefined,
      root: undefined
    },
    isLoading: false
  })
})

it('Should handle NO client WITH initial URL as APP', async () => {
  Linking.getInitialURL.mockResolvedValueOnce(appLink)

  const { result, waitForValueToChange } = renderHook(() => useAppBootstrap())

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: undefined,
    initialScreen: {
      stack: routes.welcome,
      root: routes.stack
    },
    initialRoute: {
      stack: undefined,
      root: undefined
    },
    isLoading: false
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
      stack: routes.welcome,
      root: routes.stack
    },
    initialRoute: {
      stack: undefined,
      root: undefined
    },
    isLoading: false
  })

  expect(mockHideSplashScreen).toHaveBeenCalledTimes(1)
})

it('Should handle WITH client NO initial URL', async () => {
  const { result, waitForValueToChange } = renderHook(() =>
    useAppBootstrap(mockClient)
  )

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
    isLoading: false
  })
})

it('Should handle WITH client WITH initial URL as HOME', async () => {
  Linking.getInitialURL.mockResolvedValueOnce(homeLink)

  const { result, waitForValueToChange } = renderHook(() =>
    useAppBootstrap(mockClient)
  )

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
    isLoading: false
  })
})

it('Should handle WITH client WITH initial URL as APP LINK', async () => {
  Linking.getInitialURL.mockResolvedValueOnce(appLink)

  const { result, waitForValueToChange } = renderHook(() =>
    useAppBootstrap(mockClient)
  )

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
    isLoading: false
  })
})

it('Should handle WITH client WITH initial URL as INVALID', async () => {
  Linking.getInitialURL.mockResolvedValueOnce(invalidLink)

  const { result, waitForValueToChange } = renderHook(() =>
    useAppBootstrap(mockClient)
  )

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
    isLoading: false
  })
})

it('Should handle WITH lifecycle URL as HOME', async () => {
  const { result, waitForValueToChange } = renderHook(() =>
    useAppBootstrap(mockClient)
  )

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
    isLoading: false
  })

  act(() => {
    Linking.emit('url', { url: homeLink })
  })

  expect(navigate).toHaveBeenNthCalledWith(1, routes.home, { href: initialURL })
})

it('Should handle WITH lifecycle URL as APP LINK', async () => {
  const { result, waitForValueToChange } = renderHook(() =>
    useAppBootstrap(mockClient)
  )

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
    isLoading: false
  })

  act(() => {
    Linking.emit('url', { url: appLink })
  })

  expect(navigate).toHaveBeenNthCalledWith(1, routes.cozyapp, {
    href: initialURL
  })
})

it('Should handle WITH lifecycle URL as INVALID', async () => {
  const { result, waitForValueToChange } = renderHook(() =>
    useAppBootstrap(mockClient)
  )

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
    isLoading: false
  })

  act(() => {
    Linking.emit('url', { url: invalidLink })
  })

  expect(navigate).not.toHaveBeenCalled()
})
