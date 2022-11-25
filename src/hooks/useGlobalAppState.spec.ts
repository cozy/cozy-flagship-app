import { Platform } from 'react-native'

import { _shouldLockApp } from '/hooks/useGlobalAppState'
import { routes } from '/constants/routes'

afterAll(jest.resetModules)

it('should always lock the application on iOS devices when running through the autolock check, ignoring timer', () => {
  Platform.OS = 'ios'

  const parsedRoute = { name: 'test', key: 'test' }
  const timeSinceLastActivity = 1
  const result = _shouldLockApp(parsedRoute, timeSinceLastActivity)

  expect(result).toBe(true)
})

it('should never lock the application on iOS devices when waking up to the lock screen route', () => {
  Platform.OS = 'ios'

  const parsedRoute = { name: routes.lock, key: 'test' }
  const timeSinceLastActivity = 333333
  const result = _shouldLockApp(parsedRoute, timeSinceLastActivity)

  expect(result).toBe(false)
})

it('should always lock the application on Android devices when running through the autolock check with an inactivity timer >= 5 minutes', () => {
  Platform.OS = 'android'

  const parsedRoute = { name: 'test', key: 'test' }
  const timeSinceLastActivity = 300001
  const result = _shouldLockApp(parsedRoute, timeSinceLastActivity)

  expect(result).toBe(true)
})

it('should never lock the application on Android devices when waking up to the lock screen route', () => {
  Platform.OS = 'android'

  const parsedRoute = { name: routes.lock, key: 'test' }
  const timeSinceLastActivity = 333333
  const result = _shouldLockApp(parsedRoute, timeSinceLastActivity)

  expect(result).toBe(false)
})

it('should never lock the application on Android devices when running through the autolock check with an inactivity timer <= 5 minutes', () => {
  Platform.OS = 'android'

  const parsedRoute = { name: 'test', key: 'test' }
  const timeSinceLastActivity = 300000
  const result = _shouldLockApp(parsedRoute, timeSinceLastActivity)

  expect(result).toBe(false)
})
