import { startTimeout, stopTimeout } from './handleTimeout'
import { constants } from '../constants/konnectors-constants'

test('startTimeout fires callback and deletes itself on completion', () => {
  jest.useFakeTimers()
  const onTimeout = jest.fn()

  startTimeout(onTimeout)

  jest.advanceTimersByTime(constants.timeoutDuration)

  expect(onTimeout).toHaveBeenCalled()
  expect(jest.getTimerCount()).toBe(0)
})

test('startTimeout deletes itself on demand without firing callback', () => {
  jest.useFakeTimers()
  const onTimeout = jest.fn()

  startTimeout(onTimeout)

  stopTimeout()

  expect(onTimeout).not.toHaveBeenCalled()
  expect(jest.getTimerCount()).toBe(0)
})
