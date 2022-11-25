import { getUriFromRequest } from './getUriFromRequest'

test('it returns an url with the correct scheme if none provided', () => {
  expect(getUriFromRequest({ url: 'https://cozydrive?fqdn=foo.bar.baz' })).toBe(
    'https://foo.bar.baz/'
  )
})

test('it returns a trimmed url if a whitespace url is provided', () => {
  expect(
    getUriFromRequest({ url: 'https://cozydrive?fqdn=fo++o.b+++ar.ba+++z+' })
  ).toBe('https://foo.bar.baz/')
})

test('it returns an url with the correct scheme if provided', () => {
  expect(
    getUriFromRequest({ url: 'https://cozydrive?fqdn=http://foo.bar.baz' })
  ).toBe('http://foo.bar.baz/')
})

test('it returns an url with the correct scheme if provided with an https scheme', () => {
  expect(
    getUriFromRequest({ url: 'https://cozydrive?fqdn=https://foo.bar.baz' })
  ).toBe('https://foo.bar.baz/')
})

test('it returns an url with the correct scheme if provided with a custom scheme', () => {
  expect(
    getUriFromRequest({ url: 'https://cozydrive?fqdn=cozy://foo.bar.baz' })
  ).toBe('cozy://foo.bar.baz')
})

test('it returns an url with the correct scheme if provided with a port', () => {
  expect(
    getUriFromRequest({ url: 'https://cozydrive?fqdn=cozy://foo.bar.baz:8080' })
  ).toBe('cozy://foo.bar.baz:8080')
})

test('it returns a null value if no fqdn was provided #1', () => {
  expect(getUriFromRequest({ url: 'https://cozydrive' })).toBe(null)
})

test('it returns a null value if no fqdn was provided #2', () => {
  expect(getUriFromRequest({ url: 'https://cozydrive?fqdn' })).toBe(null)
})

test('it returns a null value if no fqdn was provided #3', () => {
  expect(getUriFromRequest({ url: 'https://cozydrive?fqdn=' })).toBe(null)
})

test('it returns a null value if the url is falsy', () => {
  expect(getUriFromRequest({ url: '' })).toBe(null)
})

test('it returns a null value if the request is falsy', () => {
  expect(getUriFromRequest()).toBe(null)
})
