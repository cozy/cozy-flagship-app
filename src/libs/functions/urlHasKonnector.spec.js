import { urlHasConnectorOpen } from '/libs/functions/urlHasConnector'

it('should not throw when not given an improper URL and return false', () => {
  expect(urlHasConnectorOpen('foobared')).toBe(false)
})

it('should return false when URL does not contain a connector', () => {
  expect(urlHasConnectorOpen('https://ho.me/#/connected')).toBe(false)
})

it('should return false when URL does not contain a connector with trailing slash', () => {
  expect(urlHasConnectorOpen('https://ho.me/#/connected/')).toBe(false)
})

it('should return true when URL does contain an active connector with short hash', () => {
  expect(urlHasConnectorOpen('https://ho.me/#/connected/connector/')).toBe(true)
})

it('should return true when URL does contain an active connector with long hash', () => {
  expect(
    urlHasConnectorOpen('https://ho.me/#/connected/connector/accounts/123')
  ).toBe(true)
})
