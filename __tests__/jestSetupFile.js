global.Promise = jest.requireActual('promise')

import mockNotifee from '@notifee/react-native/jest-mock'
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock'
import mockRNCameraRoll from '@react-native-camera-roll/camera-roll/src/__mocks__/nativeInterface'
import mockClipboard from '@react-native-clipboard/clipboard/jest/clipboard-mock.js'
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock.js'
import mockBackHandler from 'react-native/Libraries/Utilities/__mocks__/BackHandler.js'
import mockRNDeviceInfo from 'react-native-device-info/jest/react-native-device-info-mock'
import mockRNPermissions from 'react-native-permissions/mock'

import { mockRNFS } from '../__mocks__/react-native-fs-mock'
import { mockRNIAP } from '../__mocks__/react-native-iap-mock'
import { mockRNInAppBrowser } from '../__mocks__/react-native-inappbrowser-reborn-mock'
import { mockRNPerformance } from '../__mocks__/react-native-performance-mock'

jest.mock('react-native-device-info', () => mockRNDeviceInfo)

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage)

jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo)

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
  init: jest.fn(),
  setTag: jest.fn()
}))

jest.mock('react-native-fs', () => mockRNFS)
jest.mock('react-native-iap', () => mockRNIAP)
jest.mock('react-native-inappbrowser-reborn', () => mockRNInAppBrowser)
jest.mock('react-native-performance', () => mockRNPerformance)
jest.mock('react-native-ios11-devicecheck', () => ({
  getToken: jest.fn()
}))

jest.mock('redux-persist', () => {
  const real = jest.requireActual('redux-persist')
  return {
    ...real,
    persistReducer: jest.fn().mockImplementation((config, reducers) => reducers)
  }
})

jest.mock('@react-native-firebase/messaging', () => ({
  hasPermission: jest.fn(() => Promise.resolve(true)),
  requestPermission: jest.fn(() => Promise.resolve(true)),
  getToken: jest.fn(() => Promise.resolve('myMockToken'))
}))

jest.mock('react-native/Libraries/Utilities/BackHandler', () => mockBackHandler)

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 0, height: 0 })
}))

jest.mock('@react-native-cookies/cookies', () => {
  return {
    get: jest.fn()
  }
})

jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn(),
  show: jest.fn(),
  getVisibilityStatus: jest.fn()
}))

jest.mock('react-native-idle-timer', () => ({
  setIdleTimerDisabled: jest.fn()
}))

jest.mock('@react-native-camera-roll/camera-roll', () => mockRNCameraRoll)

jest.mock('react-native-permissions', () => mockRNPermissions)

jest.mock('react-native-localize', () => ({
  getLocales: () => [
    {
      countryCode: 'GB',
      languageTag: 'en-GB',
      languageCode: 'en',
      isRTL: false
    },
    {
      countryCode: 'FR',
      languageTag: 'fr-FR',
      languageCode: 'fr',
      isRTL: false
    }
  ]
}))

jest.mock('../src/locales/i18n', () => {
  return {
    ...jest.requireActual('../src/locales/i18n'),
    t: jest.fn().mockImplementation(key => key),
    useI18n: jest
      .fn()
      .mockReturnValue({ t: jest.fn().mockImplementation(key => key) })
  }
})

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
jest.mock('@notifee/react-native', () => mockNotifee)

jest.mock('react-native/Libraries/Components/Switch/Switch', () => {
  const mockComponent = require('react-native/jest/mockComponent')
  return {
    default: mockComponent('react-native/Libraries/Components/Switch/Switch')
  }
})

jest.mock('@react-native-clipboard/clipboard', () => mockClipboard)

jest.mock('../src/core/tools/env', () => ({
  ...jest.requireActual('../src/core/tools/env'),
  isSentryDebugMode: () => true,
  EnvService: {
    hasSentryEnabled: () => true
  },
  devlog: jest.fn(),
  shouldDisableAutolock: jest.fn().mockReturnValue(false)
}))

jest.mock('../src/pouchdb/pouchdb', () => ({}))
jest.mock('react-native-quick-websql', () => ({}))

class mockPouchLink {
  constructor() {}
}

jest.mock('cozy-pouch-link', () => {
  return jest.fn().mockImplementation(() => {
    return new mockPouchLink()
  })
})

jest.mock('react-native-mail', () => ({
  mail: jest.fn()
}))

jest.mock('/app/domain/search/dataproxy-wrapper', () => ({
  SearchEngine: jest.fn()
}))
