import { urlHasKonnectorOpen } from '/libs/functions/urlHasKonnector'

it('should not throw when not given an improper URL and return false', () => {
  expect(urlHasKonnectorOpen('foobared')).toBe(false)
})

it('should return false when URL does not contain a konnector', () => {
  expect(urlHasKonnectorOpen('https://ho.me/#/connected')).toBe(false)
})

it('should return false when URL does not contain a konnector with trailing slash', () => {
  expect(urlHasKonnectorOpen('https://ho.me/#/connected/')).toBe(false)
})

it('should return true when URL does contain an active konnector with short hash', () => {
  expect(urlHasKonnectorOpen('https://ho.me/#/connected/konnector/')).toBe(true)
})

it('should return true when URL does contain an active konnector with long hash', () => {
  expect(
    urlHasKonnectorOpen('https://ho.me/#/connected/konnector/accounts/123')
  ).toBe(true)
})
