import { statusBarHeight, getNavbarHeight } from '/libs/dimensions'

import { addCSS } from './helpers'

it('should return a stringified HTML with added CSS', () => {
  const html = `<html><head></head><body></body></html>`
  const expected = `<html><head><style>body {--flagship-top-height: ${statusBarHeight}px; --flagship-bottom-height: ${getNavbarHeight()}px;}</style></head><body></body></html>`

  expect(addCSS(html)).toEqual(expected)
})
