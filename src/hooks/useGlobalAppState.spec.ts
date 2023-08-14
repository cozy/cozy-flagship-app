import { Platform } from 'react-native'

import { _shouldLockApp } from '/app/domain/authorization/services/SecurityService'
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

it('should lock the application on Android devices when running through the autolock check with an inactivity timer just above 5 minutes', () => {
  Platform.OS = 'android'

  const parsedRoute = { name: 'test', key: 'test' }
  const timeSinceLastActivity = 300001 // Just over 5 minutes
  const result = _shouldLockApp(parsedRoute, timeSinceLastActivity)

  expect(result).toBe(true)
})

it('should not lock the application on Android devices when running through the autolock check with an inactivity timer just below 5 minutes', () => {
  Platform.OS = 'android'

  const parsedRoute = { name: 'test', key: 'test' }
  const timeSinceLastActivity = 299999 // Just below 5 minutes
  const result = _shouldLockApp(parsedRoute, timeSinceLastActivity)

  expect(result).toBe(false)
})

it('should handle negative time since last activity', () => {
  Platform.OS = 'android'

  const parsedRoute = { name: 'test', key: 'test' }
  const timeSinceLastActivity = -300001
  const result = _shouldLockApp(parsedRoute, timeSinceLastActivity)

  // This is a weird case, but it should be handled (it can happen when the user changes the time on his device)
  // As the time is negative, it should be considered as 0
  expect(result).toBe(true)
})

it('should handle undefined route name on Android devices', () => {
  Platform.OS = 'android'

  const parsedRoute = { name: undefined, key: 'test' } // name is undefined
  const timeSinceLastActivity = 300001
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  const result = _shouldLockApp(parsedRoute as any, timeSinceLastActivity)

  expect(result).toBe(true)
})

it('should handle non-string route name on Android devices', () => {
  Platform.OS = 'android'

  const parsedRoute = { name: 12345, key: 'test' } // name is not a string
  const timeSinceLastActivity = 300001
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  const result = _shouldLockApp(parsedRoute as any, timeSinceLastActivity)

  expect(result).toBe(true)
})

it('should handle an empty route name', () => {
  Platform.OS = 'android'

  const parsedRoute = { name: '', key: 'test' }
  const timeSinceLastActivity = 300001
  const result = _shouldLockApp(parsedRoute, timeSinceLastActivity)

  expect(result).toBe(true)
})

it('should handle no route', () => {
  Platform.OS = 'android'

  const parsedRoute = undefined as unknown as { name: string; key: string }
  const timeSinceLastActivity = 300001
  const result = _shouldLockApp(parsedRoute, timeSinceLastActivity)

  expect(result).toBe(true)
})
