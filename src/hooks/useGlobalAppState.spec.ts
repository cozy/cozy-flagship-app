import { Platform } from 'react-native'

import { _shouldLockApp } from '/app/domain/authorization/services/SecurityService'

jest.mock('react-native-file-viewer', () => ({
  open: jest.fn()
}))

afterAll(jest.resetModules)

it('should always lock the application on iOS devices when running through the autolock check, ignoring timer', () => {
  Platform.OS = 'ios'

  const timeSinceLastActivity = 1
  const result = _shouldLockApp(timeSinceLastActivity)

  expect(result).toBe(true)
})

it('should always lock the application on Android devices when running through the autolock check with an inactivity timer >= 5 minutes', () => {
  Platform.OS = 'android'

  const timeSinceLastActivity = 300001
  const result = _shouldLockApp(timeSinceLastActivity)

  expect(result).toBe(true)
})

it('should never lock the application on Android devices when running through the autolock check with an inactivity timer <= 5 minutes', () => {
  Platform.OS = 'android'

  const timeSinceLastActivity = 300000
  const result = _shouldLockApp(timeSinceLastActivity)

  expect(result).toBe(false)
})

it('should lock the application on Android devices when running through the autolock check with an inactivity timer just above 5 minutes', () => {
  Platform.OS = 'android'

  const timeSinceLastActivity = 300001 // Just over 5 minutes
  const result = _shouldLockApp(timeSinceLastActivity)

  expect(result).toBe(true)
})

it('should not lock the application on Android devices when running through the autolock check with an inactivity timer just below 5 minutes', () => {
  Platform.OS = 'android'

  const timeSinceLastActivity = 299999 // Just below 5 minutes
  const result = _shouldLockApp(timeSinceLastActivity)

  expect(result).toBe(false)
})

it('should handle negative time since last activity', () => {
  Platform.OS = 'android'

  const timeSinceLastActivity = -300001
  const result = _shouldLockApp(timeSinceLastActivity)

  // This is a weird case, but it should be handled (it can happen when the user changes the time on his device)
  // As the time is negative, it should be considered as 0
  expect(result).toBe(true)
})
