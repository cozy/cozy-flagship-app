import { RouteProp } from '@react-navigation/native'
import { waitFor } from '@testing-library/react-native'
import { renderHook, act } from '@testing-library/react-hooks'

import useUIState from './useUIState'

import { flagshipUI } from '/libs/intents/setFlagshipUI'

jest.mock('/libs/intents/localMethods')
jest.mock('/libs/intents/setFlagshipUI')
jest.mock('@react-native-cookies/cookies', () => ({
  set: jest.fn()
}))
const mockRoute = {
  key: '123',
  name: 'CozyApp',
  params: {
    iconParams: {
      // Mock route.params.iconParams data here
    }
  }
} as RouteProp<Record<string, object | undefined>, string>

describe('useUIState', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should set isFirstHalf and isReady states based on route params', () => {
    const { result } = renderHook(() => useUIState(mockRoute))

    expect(result.current.isFirstHalf).toBe(false)
    expect(result.current.isReady).toBe(false)

    act(() => {
      result.current.setFirstHalf(true)
      result.current.setReady(true)
    })

    expect(result.current.isFirstHalf).toBe(true)
    expect(result.current.isReady).toBe(true)
  })

  it('should update UIState based on flagshipUI event', async () => {
    const { result } = renderHook(() => useUIState(mockRoute))

    expect(result.current.UIState).toEqual({})

    act(() => {
      // Trigger the 'change' event on the flagshipUI object
      flagshipUI.emit('change', {
        bottomBackground: 'red',
        bottomTheme: 'light'
      })
    })

    await waitFor(() => {
      return (
        result.current.UIState.bottomBackground === 'red' &&
        result.current.UIState.bottomTheme === 'light'
      )
    })

    expect(result.current.UIState).toEqual({
      bottomBackground: 'red',
      bottomTheme: 'light'
    })
  })

  // Add more test cases here
})
