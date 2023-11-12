/* eslint-disable no-console */ // we're mocking console
import { tryConsole } from './jsLogInterception'

const logId = 'logId'
const logger = {
  log: jest.fn(),
  debug: jest.fn()
} as unknown as MiniLogger
const makePayload = ({
  type,
  args
}: {
  type: string
  args?: string[]
}): {
  nativeEvent: {
    data: string
  }
} => ({
  nativeEvent: {
    data: JSON.stringify({
      type: 'Console',
      data: { type, log: ['one', 'two', 'three', ...(args ?? [])] }
    })
  }
})

afterEach(() => {
  jest.clearAllMocks()
})

it('handles default case', () => {
  const payload = { ...makePayload({ type: 'log' }) }

  tryConsole(payload, logger, logId)

  expect(logger.log).toHaveBeenNthCalledWith(
    1,
    '[Console logId]',
    'one',
    'two',
    'three'
  )
})

it('handles default case with another type', () => {
  const payload = { ...makePayload({ type: 'debug' }) }

  tryConsole(payload, logger, logId)

  expect(logger.debug).toHaveBeenNthCalledWith(
    1,
    '[Console logId]',
    'one',
    'two',
    'three'
  )
})

it('handles post-me case', () => {
  console.debug = jest.fn()

  const payload = { ...makePayload({ type: 'debug', args: ['@post-me'] }) }

  tryConsole(payload, logger, logId)

  expect(console.debug).toHaveBeenNthCalledWith(
    1,
    'one',
    'two',
    'three',
    '@post-me'
  )
})

it('recovers when erroring', () => {
  console.error = jest.fn()

  // @ts-expect-error - we're testing error handling
  tryConsole()

  expect(console.error).toHaveBeenCalledTimes(1)
})

it('ignores other events', () => {
  console.error = jest.fn()

  const payload = {
    nativeEvent: { data: JSON.stringify({ foo: 'bar', type: 'baz' }) }
  }

  tryConsole(payload, logger, logId)

  expect(console.error).not.toHaveBeenCalled()
  expect(logger.log).not.toHaveBeenCalled()
  expect(logger.debug).not.toHaveBeenCalled()
})
