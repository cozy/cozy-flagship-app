import { consumeRouteParameter } from './routeHelpers'

describe('consumeRouteParameter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return parameter and clear it from navigation when parameter exist', async () => {
    const route = {
      params: {
        foo: 'bar'
      }
    }

    const navigation = {
      setParams: jest.fn()
    }

    const param = consumeRouteParameter('foo', route, navigation)

    expect(param).toBe('bar')
    expect(navigation.setParams).toHaveBeenCalled()
    expect(navigation.setParams.mock.calls[0][0]).toStrictEqual({
      foo: undefined
    })
  })

  it('should return undefined and should not try to clear it from navigation when parameter does not exist', async () => {
    const route = {
      params: {
        foo: 'bar'
      }
    }

    const navigation = {
      setParams: jest.fn()
    }

    const param = consumeRouteParameter('unexistingParam', route, navigation)

    expect(param).toBe(undefined)
    expect(navigation.setParams).not.toHaveBeenCalled()
  })

  it('should return parameter and clear it from navigation when parameter exist but has falsy value', async () => {
    const route = {
      params: {
        foo: 0
      }
    }

    const navigation = {
      setParams: jest.fn()
    }

    const param = consumeRouteParameter('foo', route, navigation)

    expect(param).toBe(0)
    expect(navigation.setParams).toHaveBeenCalled()
    expect(navigation.setParams.mock.calls[0][0]).toStrictEqual({
      foo: undefined
    })
  })
})
