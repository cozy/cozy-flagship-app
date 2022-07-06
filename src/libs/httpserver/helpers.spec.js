import { compose } from '/libs/functions/compose'
import { statusBarHeight, getNavbarHeight } from '/libs/dimensions'
import {
  addBodyClasses,
  addCSS,
  addMetaAttributes
} from '/libs/httpserver/helpers'

jest.mock('/libs/RootNavigation.js', () => ({
  navigationRef: {
    getCurrentRoute: jest.fn().mockReturnValue({ name: 'home' })
  }
}))

it('should return a stringified HTML with added CSS', () => {
  const html = `<html><head></head><body></body></html>`
  const expected = `<html><head><style>body {--flagship-top-height: ${statusBarHeight}px; --flagship-bottom-height: ${getNavbarHeight()}px;}</style></head><body></body></html>`

  expect(addCSS(html)).toEqual(expected)
})

it('should return a stringified HTML with added body classes', () => {
  const html = `<html><head></head><body></body></html>`
  const expected = `<html><head></head><body class="flagship-app flagship-os-ios flagship-route-home"></body></html>`

  expect(addBodyClasses(html)).toEqual(expected)
})

it('should return a stringified HTML with added meta tags', () => {
  const html = `<html><head></head><body></body></html>`
  const expected = `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" /></head><body></body></html>`

  expect(addMetaAttributes(html)).toEqual(expected)
})

it('should be able to handle composition', () => {
  const html = `<html><head></head><body></body></html>`
  const expected = `<html><head><style>body {--flagship-top-height: 20px; --flagship-bottom-height: 0px;}</style><meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" /></head><body class="flagship-app flagship-os-ios flagship-route-home"></body></html>`

  expect(compose(addCSS, addBodyClasses, addMetaAttributes)(html)).toEqual(
    expected
  )
})
