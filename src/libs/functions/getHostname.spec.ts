import { getHostname } from '/libs/functions/getHostname'

it('returns a hostname from a native event', () => {
  expect(getHostname({ url: 'https://ho.me/foo/#/foobared' })).toBe('ho.me')
})

it('does not throw if no valid hostname, and return url key as is', () => {
  expect(getHostname({ url: 'notvalid' })).toBe('notvalid')
})

it('does not throw if no url key', () => {
  expect(getHostname({})).toBeUndefined()
})

it('does not throw if no event at all', () => {
  expect(getHostname()).toBeUndefined()
})

it('does not throw if event with empty url', () => {
  expect(getHostname({ url: undefined })).toBeUndefined()
})
