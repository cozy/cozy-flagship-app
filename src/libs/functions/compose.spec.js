import { compose } from './compose'

it('composes functions', () => {
  const funcA = arg => arg + arg
  const funcB = arg => arg * arg
  const funcC = arg => arg ** arg

  expect(compose(funcA, funcB, funcC)(1)).toBe(256)
})
