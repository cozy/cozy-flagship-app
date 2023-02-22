import { Linking } from 'react-native'
import { act, renderHook } from '@testing-library/react-hooks'

import { navigate } from '/libs/RootNavigation'
import { routes } from '/constants/routes'
import { useAppBootstrap } from '/hooks/useAppBootstrap'

const mockHideSplashScreen = jest.fn()
const mockClient = {
  getStackClient: jest.fn().mockReturnValue({ fetchJSON: jest.fn() }),
  capabilities: {
    flat_subdomains: 'flat'
  }
}
const HOME_FALLBACK_URL =
  'https://claude-drive.mycozy.cloud/#/connected/konnector_slug/new'
const HOME_FALLBACK_URL_ENCODED =
  'https%3A%2F%2Fclaude-drive.mycozy.cloud%2F%23%2Fconnected%2Fkonnector_slug%2Fnew'
const HOME_UNIVERSAL_LINK = `https://links.mycozy.cloud/flagship/home?fallback=${HOME_FALLBACK_URL_ENCODED}`
const HOME_ANDROID_SCHEME = `cozy://home?fallback=${HOME_FALLBACK_URL_ENCODED}`
const APP_FALLBACK_URL = `https://claude-drive.mycozy.cloud/#/folder/SOME_FOLDER_ID`
const APP_FALLBACK_URL_ENCODED = `https%3A%2F%2Fclaude-drive.mycozy.cloud%2F%23%2Ffolder%2FSOME_FOLDER_ID`
const APP_UNIVERSAL_LINK = `https://links.mycozy.cloud/flagship/drive/folder/SOME_FOLDER_ID?fallback=${APP_FALLBACK_URL_ENCODED}`
const APP_ANDROID_SCHEME = `cozy://drive/folder/SOME_FOLDER_ID?fallback=${APP_FALLBACK_URL_ENCODED}`
const INVALID_LINK = 'https://foo.com'

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

jest.mock('/libs/functions/openApp', () => ({
  getDefaultIconParams: jest.fn().mockReturnValue({})
}))

jest.mock('cozy-client', () => ({
  deconstructCozyWebLinkWithSlug: jest.fn().mockImplementation(url => {
    if (url === HOME_FALLBACK_URL) {
      return { slug: 'home' }
    } else if (url === APP_FALLBACK_URL) {
      return { slug: 'drive' }
    } else {
      throw new Error('Should not happen')
    }
  })
}))

const listeners = []
const mockRemove = jest.fn().mockImplementation(listener => {
  return () => {
    const index = listeners.findIndex(l => l === listener)
    listeners.splice(index, 1)
  }
})
jest.mock('react-native', () => {
  return {
    LogBox: {
      ignoreAllLogs: jest.fn()
    },
    Linking: {
      addEventListener: jest.fn((event, handler) => {
        const listener = { event, handler }
        listeners.push(listener)

        return { remove: mockRemove(listener) }
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
    initialRoute: {
      route: routes.instanceCreation,
      params: {
        onboardUrl: paramOnboardUrl
      }
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
    initialRoute: {
      route: routes.authenticate,
      params: {
        fqdn: paramFqdn
      }
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
    initialRoute: {
      route: routes.welcome
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
    initialRoute: {
      route: routes.welcome
    },
    isLoading: false
  })

  expect(mockHideSplashScreen).toHaveBeenCalledTimes(1)
})

it('Should handle NO client WITH initial URL as HOME', async () => {
  Linking.getInitialURL.mockResolvedValueOnce(HOME_UNIVERSAL_LINK)

  const { result, waitForValueToChange } = renderHook(() => useAppBootstrap())

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: undefined,
    initialRoute: {
      route: routes.welcome
    },
    isLoading: false
  })
})

it('Should handle NO client WITH initial URL as APP', async () => {
  Linking.getInitialURL.mockResolvedValueOnce(APP_UNIVERSAL_LINK)

  const { result, waitForValueToChange } = renderHook(() => useAppBootstrap())

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: undefined,
    initialRoute: {
      route: routes.welcome
    },
    isLoading: false
  })

  expect(mockHideSplashScreen).toHaveBeenCalledTimes(1)
})

it('Should handle NO client WITH initial URL as INVALID', async () => {
  Linking.getInitialURL.mockResolvedValueOnce(INVALID_LINK)

  const { result, waitForValueToChange } = renderHook(() => useAppBootstrap())

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: undefined,
    initialRoute: {
      route: routes.welcome
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
    initialRoute: {
      route: routes.home,
      params: {
        mainAppFallbackURL: undefined,
        cozyAppFallbackURL: undefined
      }
    },
    isLoading: false
  })
})

it('Should handle WITH client WITH initial URL as HOME (Universal Link)', async () => {
  Linking.getInitialURL.mockResolvedValueOnce(HOME_UNIVERSAL_LINK)

  const { result, waitForValueToChange } = renderHook(() =>
    useAppBootstrap(mockClient)
  )

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: mockClient,
    initialRoute: {
      route: routes.home,
      params: {
        mainAppFallbackURL: HOME_FALLBACK_URL,
        cozyAppFallbackURL: undefined
      }
    },
    isLoading: false
  })
})

it('Should handle WITH client WITH initial URL as HOME (Android Scheme)', async () => {
  Linking.getInitialURL.mockResolvedValueOnce(HOME_ANDROID_SCHEME)

  const { result, waitForValueToChange } = renderHook(() =>
    useAppBootstrap(mockClient)
  )

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: mockClient,
    initialRoute: {
      route: routes.home,
      params: {
        mainAppFallbackURL: HOME_FALLBACK_URL,
        cozyAppFallbackURL: undefined
      }
    },
    isLoading: false
  })
})

it('Should handle WITH client WITH initial URL as APP LINK (Universal Link)', async () => {
  Linking.getInitialURL.mockResolvedValueOnce(APP_UNIVERSAL_LINK)

  const { result, waitForValueToChange } = renderHook(() =>
    useAppBootstrap(mockClient)
  )

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: mockClient,
    initialRoute: {
      route: routes.home,
      params: {
        mainAppFallbackURL: undefined,
        cozyAppFallbackURL: APP_FALLBACK_URL
      }
    },
    isLoading: false
  })
})

it('Should handle WITH client WITH initial URL as APP LINK (Android Scheme)', async () => {
  Linking.getInitialURL.mockResolvedValueOnce(APP_ANDROID_SCHEME)

  const { result, waitForValueToChange } = renderHook(() =>
    useAppBootstrap(mockClient)
  )

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: mockClient,
    initialRoute: {
      route: routes.home,
      params: {
        mainAppFallbackURL: undefined,
        cozyAppFallbackURL: APP_FALLBACK_URL
      }
    },
    isLoading: false
  })
})

it('Should handle WITH client WITH initial URL as INVALID', async () => {
  Linking.getInitialURL.mockResolvedValueOnce(INVALID_LINK)

  const { result, waitForValueToChange } = renderHook(() =>
    useAppBootstrap(mockClient)
  )

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: mockClient,
    initialRoute: {
      route: routes.home,
      params: {
        mainAppFallbackURL: undefined,
        cozyAppFallbackURL: undefined
      }
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
    initialRoute: {
      route: routes.home,
      params: {
        mainAppFallbackURL: undefined,
        cozyAppFallbackURL: undefined
      }
    },
    isLoading: false
  })

  act(() => {
    Linking.emit('url', { url: HOME_UNIVERSAL_LINK })
  })

  expect(navigate).toHaveBeenNthCalledWith(1, routes.home, {
    href: HOME_FALLBACK_URL,
    slug: 'home',
    iconParams: expect.anything()
  })
})

it('Should handle WITH lifecycle URL as APP LINK', async () => {
  const { result, waitForValueToChange } = renderHook(() =>
    useAppBootstrap(mockClient)
  )

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: mockClient,
    initialRoute: {
      route: routes.home,
      params: {
        mainAppFallbackURL: undefined,
        cozyAppFallbackURL: undefined
      }
    },
    isLoading: false
  })

  act(() => {
    Linking.emit('url', {
      url: APP_UNIVERSAL_LINK
    })
  })

  expect(navigate).toHaveBeenNthCalledWith(1, routes.cozyapp, {
    href: APP_FALLBACK_URL,
    slug: 'drive',
    iconParams: expect.anything()
  })
})

it('Should handle WITH lifecycle URL as INVALID', async () => {
  const { result, waitForValueToChange } = renderHook(() =>
    useAppBootstrap(mockClient)
  )

  await waitForValueToChange(() => result.current.isLoading)

  expect(result.current).toStrictEqual({
    client: mockClient,
    initialRoute: {
      route: routes.home,
      params: {
        mainAppFallbackURL: undefined,
        cozyAppFallbackURL: undefined
      }
    },
    isLoading: false
  })

  act(() => {
    Linking.emit('url', { url: INVALID_LINK })
  })

  expect(navigate).not.toHaveBeenCalled()
})
