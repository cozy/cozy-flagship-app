import AsyncStorage from '@react-native-async-storage/async-storage'

import * as RootNavigation from '../RootNavigation.js'
import strings from '../../strings.json'
import {localMethods, asyncCore} from './localMethods'
jest.mock('react-native-keychain')

RootNavigation.navigate = jest.fn()

test('logout should handle AsyncStorage and Navigation', async () => {
  await AsyncStorage.setItem(strings.OAUTH_STORAGE_KEY, '1')
  await AsyncStorage.setItem(strings.SESSION_CREATED_FLAG, '1')

  await asyncCore()
  expect(await AsyncStorage.getItem(strings.OAUTH_STORAGE_KEY)).toBeFalsy()
  expect(await AsyncStorage.getItem(strings.SESSION_CREATED_FLAG)).toBeFalsy()
  expect(RootNavigation.navigate).toHaveBeenCalledWith('authenticate')
})

test('backToHome should handle Navigation', async () => {
  localMethods.backToHome()

  expect(RootNavigation.navigate).toHaveBeenCalledWith('home')
})
