type AsyncVoidFunction<T extends unknown[]> = (...args: T) => Promise<void>

/**
 * @description `safePromise()` is a wrapper for an async function that will catch any errors
 * it is mandatory to implement error handling in the async function you're wrapping,
 * otherwise the error handling will be brittle, possibly leading to big issues
 *
 * @param asyncFn Safe wrapper for an async function
 *
 * @returns A function that will call the async function and ignore any errors
 *
 * @example
 * const asyncFn = async (arg1, arg2) => {
 *  // do something
 * }
 * const safeAsyncFn = safePromise(asyncFn)
 * safeAsyncFn(arg1, arg2) // will call asyncFn(arg1, arg2) and ignore any errors
 */
export const safePromise = <T extends unknown[]>(
  asyncFn: AsyncVoidFunction<T>
) => {
  return (...args: T): void => {
    void asyncFn(...args)
  }
}
