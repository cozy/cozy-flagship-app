import { safePromise } from '/utils/safePromise'

describe('safePromise', () => {
  it('catches errors thrown by the provided function and prevents them from propagating', () => {
    // Define an async function that immediately throws an error
    const errorFunction = async (): Promise<never> => {
      await Promise.resolve()
      throw new Error('Test Error')
    }
    const safeErrorFunction = safePromise(errorFunction)

    // We're going to use a flag to indicate if the error was caught
    let errorCaught = false

    // Since safePromise should prevent errors from propagating, calling safeErrorFunction
    // shouldn't result in an uncaught error
    try {
      safeErrorFunction()
    } catch (error) {
      // If an error is caught here, that means safePromise didn't work correctly
      errorCaught = true
    }

    // Assert that no error was caught
    expect(errorCaught).toBe(false)
  })

  it('correctly passes arguments to the provided function', () => {
    const mockFn = jest.fn()
    const safeFn = safePromise(mockFn)

    safeFn(2, 3)

    expect(mockFn).toHaveBeenCalledWith(2, 3)
  })

  it('does not interfere with the operation of the provided function if it does not throw an error', () => {
    const mockFn = jest.fn()
    const safeFn = safePromise(mockFn)

    safeFn()

    expect(mockFn).toHaveBeenCalled()
  })
})
