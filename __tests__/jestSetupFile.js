import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock'
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock.js'

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage)
jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo)

jest.mock(
  '../src/api-keys.json',
  () => ({
    androidSafetyNetApiKey: 'foo'
  }),
  { virtual: true }
)
