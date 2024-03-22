import {
  addBodyClasses,
  addBarStyles,
  addMetaAttributes,
  addColorSchemeMetaIfNecessary
} from '/libs/httpserver/server-helpers'

jest.mock('react-native-safe-area-context', () => ({
  initialWindowMetrics: {
    insets: {
      bottom: 25,
      top: 33
    }
  }
}))

jest.mock('/libs/RootNavigation', () => ({
  navigationRef: {
    getCurrentRoute: jest.fn().mockReturnValue({ name: 'home' })
  }
}))

it('should return a stringified HTML with added CSS', () => {
  const html = `<html><head></head><body></body></html>`
  const expected = `<html><head><style>body {--flagship-top-height: 33px; --flagship-bottom-height: 25px;}</style></head><body></body></html>`

  expect(addBarStyles(html)).toEqual(expected)
})

it('should return a stringified HTML with added body classes', () => {
  const html = `<html><head></head><body></body></html>`
  const expected = `<html><head></head><body class="flagship-app flagship-os-ios flagship-route-home"></body></html>`

  expect(addBodyClasses(html)).toEqual(expected)
})

it('should return a stringified HTML with added body classes if body has no class attribute but child div has class attribute', () => {
  const html = `<html><head></head><body><div role="application" class="application"></div></body></html>`
  const expected = `<html><head></head><body class="flagship-app flagship-os-ios flagship-route-home"><div role="application" class="application"></div></body></html>`

  expect(addBodyClasses(html)).toEqual(expected)
})

it('should return a stringified HTML with appended body classes', () => {
  const html = `<html class="it"><head class="works"></head><body id="baz" class="foo bar" data-class="test"></body></html>`
  const expected = `<html class="it"><head class="works"></head><body id="baz" class="foo bar flagship-app flagship-os-ios flagship-route-home" data-class="test"></body></html>`

  expect(addBodyClasses(html)).toEqual(expected)
})

it('should return a stringified HTML with added meta tags', () => {
  const html = `<html><head></head><body></body></html>`
  const expected = `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" /></head><body></body></html>`

  expect(addMetaAttributes(html)).toEqual(expected)
})

it('should add color-scheme meta tag if not present', () => {
  const html = `<html><head></head><body></body></html>`
  const expected = `<html><head><meta name="color-scheme" content="light only"/></head><body></body></html>`
  expect(addColorSchemeMetaIfNecessary(html)).toEqual(expected)
})

it('should not add color-scheme meta tag if already present', () => {
  const html = `<html><head><meta name="color-scheme" content="dark only"/></head><body></body></html>`
  const expected = `<html><head><meta name="color-scheme" content="dark only"/></head><body></body></html>`
  expect(addColorSchemeMetaIfNecessary(html)).toEqual(expected)
})
