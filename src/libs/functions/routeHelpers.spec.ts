import { NavigationProp, RouteProp } from '@react-navigation/native'

import { consumeRouteParameter } from '/libs/functions/routeHelpers'

const navigation = {
  setParams: jest.fn()
} as unknown as NavigationProp<Record<string, object | undefined>, string> & {
  setParams: jest.Mock
}

describe('consumeRouteParameter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return parameter and clear it from navigation when parameter exist', () => {
    const route = {
      params: {
        foo: 'bar'
      }
    } as RouteProp<Record<string, object | undefined>, string>

    const param = consumeRouteParameter('foo', route, navigation)

    expect(param).toBe('bar')
    expect(navigation.setParams).toHaveBeenCalled()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(navigation.setParams.mock.calls[0][0]).toStrictEqual({
      foo: undefined
    })
  })

  it('should return undefined and should not try to clear it from navigation when parameter does not exist', () => {
    const route = {
      params: {
        foo: 'bar'
      }
    } as RouteProp<Record<string, object | undefined>, string>

    const param = consumeRouteParameter('unexistingParam', route, navigation)

    expect(param).toBe(undefined)
    expect(navigation.setParams).not.toHaveBeenCalled()
  })

  it('should return parameter and clear it from navigation when parameter exist but has falsy value', () => {
    const route = {
      params: {
        foo: 0
      }
    } as RouteProp<Record<string, object | undefined>, string>

    const param = consumeRouteParameter('foo', route, navigation)

    expect(param).toBe(0)
    expect(navigation.setParams).toHaveBeenCalled()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(navigation.setParams.mock.calls[0][0]).toStrictEqual({
      foo: undefined
    })
  })
})
