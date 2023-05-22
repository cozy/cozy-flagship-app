type AsyncVoidFunction<T extends unknown[]> = (...args: T) => Promise<void>

/**
 * @description `safePromise()` is a wrapper to be placed arround promises that already handle their own errors internally. With this wrapper Typescript would allow to call them without a surrounding try...catch
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
