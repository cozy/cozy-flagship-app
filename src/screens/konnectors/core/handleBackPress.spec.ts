import { BackHandler } from 'react-native'

import { stopExecIfVisible, handleBackPress } from './handleBackPress'

const mockPlatform = {
  OS: 'android'
}

jest.mock('react-native/Libraries/Utilities/Platform', () => mockPlatform)

describe('stopExecIfVisible', () => {
  it('should call onStopExecution if worker.visible is true', () => {
    const launcherView = {
      state: { worker: { visible: true } },
      onStopExecution: jest.fn()
    }

    stopExecIfVisible(launcherView)

    expect(launcherView.onStopExecution).toHaveBeenCalled()
  })

  it('should not call onStopExecution if worker.visible is false', () => {
    const launcherView = {
      state: { worker: { visible: false } },
      onStopExecution: jest.fn()
    }

    stopExecIfVisible(launcherView)

    expect(launcherView.onStopExecution).not.toHaveBeenCalled()
  })

  it('should return true', () => {
    const result = stopExecIfVisible()

    expect(result).toBe(true)
  })
})

describe('handleBackPress', () => {
  const launcherView = {
    state: { worker: { visible: true } },
    onStopExecution: jest.fn()
  }

  afterEach(() => {
    launcherView.onStopExecution.mockClear()
    mockPlatform.OS = 'android'
  })

  it('should not add event listeners if Platform.OS is not android', () => {
    mockPlatform.OS = 'ios'

    const removeListeners = handleBackPress(launcherView, [])
    expect(jest.spyOn(BackHandler, 'addEventListener')).not.toHaveBeenCalled()
    expect(removeListeners).toBeInstanceOf(Function)
  })

  it('should add event listeners with bound callbacks if Platform.OS is android', () => {
    const callback1 = jest.fn()
    const callback2 = jest.fn()

    const removeListeners = handleBackPress(launcherView, [
      callback1,
      callback2
    ])

    expect(callback1).not.toHaveBeenCalled()
    expect(callback2).not.toHaveBeenCalled()
    expect(jest.spyOn(BackHandler, 'addEventListener')).toHaveBeenCalledTimes(2)
    expect(
      jest.spyOn(BackHandler, 'removeEventListener')
    ).not.toHaveBeenCalled()

    // Simulate hardware back press
    // @ts-expect-error mockPressBack is defined in the mock but not in the types of the mock
    BackHandler.mockPressBack() // eslint-disable-line @typescript-eslint/no-unsafe-call

    expect(callback1).toHaveBeenCalledWith(launcherView)
    expect(callback2).toHaveBeenCalledWith(launcherView)

    // Call removeListeners to remove event listeners
    removeListeners()

    expect(
      jest.spyOn(BackHandler, 'removeEventListener')
    ).toHaveBeenCalledTimes(2)
  })
})
