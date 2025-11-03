/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { BackHandler, AppState } from 'react-native'
import * as MockBackHandler from 'react-native/Libraries/Utilities/__mocks__/BackHandler'

import { routes } from '/constants/routes'
import { navigationRef } from '/libs/RootNavigation'

import { SecurityNavigationService } from './SecurityNavigationService'

// Mock BackHandler and AppState
jest.mock('react-native', () => ({
  BackHandler: {
    ...MockBackHandler,
    exitApp: jest.fn(),
    addEventListener: jest.fn().mockReturnThis(),
    remove: jest.fn()
  },
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn().mockReturnThis(),
    remove: jest.fn()
  },
  Platform: {
    OS: 'ios',
    select: jest.fn(options => options.default || options.ios)
  }
}))

describe('SecurityNavigationService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    SecurityNavigationService.stopListening()
  })

  it('starts and stops listening correctly', () => {
    // Mock navigationRef
    navigationRef.current = {
      getCurrentRoute: jest.fn().mockReturnValue({ name: routes.lock })
    } as any

    SecurityNavigationService.startListening()

    expect(BackHandler.addEventListener).toHaveBeenCalledWith(
      'hardwareBackPress',
      expect.any(Function)
    )

    expect(AppState.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    )

    SecurityNavigationService.stopListening()

    // @ts-expect-error: Mocked function
    expect(BackHandler.remove).toHaveBeenCalled()
    // @ts-expect-error: Mocked function
    expect(AppState.remove).toHaveBeenCalled()
  })

  it('exits the app when back button is pressed on exit routes', () => {
    // Mock navigationRef
    navigationRef.current = {
      getCurrentRoute: jest.fn().mockReturnValue({ name: routes.lock })
    } as any

    SecurityNavigationService.startListening()

    // Simulate back button press
    // @ts-expect-error: Mocked function
    const backPressHandler = BackHandler.addEventListener.mock.calls[0][1]
    backPressHandler()

    expect(BackHandler.exitApp).toHaveBeenCalled()
  })

  it('does not exit the app when back button is pressed on non-exit routes', () => {
    // Mock a non-exit route
    navigationRef.current = {
      getCurrentRoute: jest.fn().mockReturnValue({ name: routes.home })
    } as any

    SecurityNavigationService.startListening()

    // Simulate back button press
    // @ts-expect-error: Mocked function
    const backPressHandler = BackHandler.addEventListener.mock.calls[0][1]
    backPressHandler()

    expect(MockBackHandler.exitApp).not.toHaveBeenCalled()
  })
})
