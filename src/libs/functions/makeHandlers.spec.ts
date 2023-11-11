import { makeHandlers } from '/libs/functions/makeHandlers'

it('does not throw with bad HOF bad closure', () => {
  // @ts-expect-error : we want to test this case
  const badHandler = makeHandlers(NaN)
  expect(() => badHandler()).not.toThrow()
})

it('does not throw with good HOF bad closure 1', () => {
  const goodHandler = makeHandlers({ foo: jest.fn() })
  expect(() => goodHandler()).not.toThrow()
})

it('does not throw with good HOF bad closure 2', () => {
  const goodHandler = makeHandlers({ foo: jest.fn() })
  expect(() => goodHandler({})).not.toThrow()
})

it('does not throw with good HOF bad closure 3', () => {
  const goodHandler = makeHandlers({ foo: jest.fn() })
  // @ts-expect-error : we want to test this case
  expect(() => goodHandler({ nativeEvent: '19' })).not.toThrow()
})

it('does not throw with good HOF bad closure 4', () => {
  const goodHandler = makeHandlers({ foo: jest.fn() })
  expect(() => goodHandler({ nativeEvent: { data: 87 } })).not.toThrow()
})

it('does not throw with good HOF good closure bad data', () => {
  const goodHandler = makeHandlers({ foo: jest.fn() })
  expect(() => goodHandler({ nativeEvent: { data: 'bad' } })).not.toThrow()
})

it('should call good handler function, contained in native event with single string', () => {
  const mockHandlerFn = jest.fn()
  const goodHandler = makeHandlers({ good: mockHandlerFn })
  goodHandler({ nativeEvent: { data: 'good' } })
  expect(mockHandlerFn).toHaveBeenCalledTimes(1)
})

it('should call good handler function, contained in native event with multiple strings', () => {
  const mockHandlerFn = jest.fn()
  const goodHandler = makeHandlers({ good: mockHandlerFn })
  goodHandler({ nativeEvent: { data: '123good456' } })
  expect(mockHandlerFn).toHaveBeenCalledTimes(1)
})

it('should call good handler functions, contained in native event with multiple strings', () => {
  const mockHandlerFn = jest.fn()
  const mockHandlerFn2 = jest.fn()
  const goodHandler = makeHandlers({
    good: mockHandlerFn,
    neat: mockHandlerFn2
  })
  goodHandler({ nativeEvent: { data: '121good0121neat12neat45goodgood' } })
  expect(mockHandlerFn).toHaveBeenCalledTimes(1)
  expect(mockHandlerFn2).toHaveBeenCalledTimes(1)
})
