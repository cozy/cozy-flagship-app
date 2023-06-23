import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock'
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock.js'
import mockBackHandler from 'react-native/Libraries/Utilities/__mocks__/BackHandler.js'
import mockRNDeviceInfo from 'react-native-device-info/jest/react-native-device-info-mock'

import { mockRNFS } from '../__mocks__/react-native-fs-mock'

jest.mock('react-native-device-info', () => mockRNDeviceInfo)

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage)

jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo)

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
  init: jest.fn(),
  setTag: jest.fn()
}))

jest.mock(
  '../src/constants/api-keys',
  () => ({
    androidSafetyNetApiKey: 'foo'
  }),
  { virtual: true }
)

jest.mock('react-native-fs', () => mockRNFS)

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
