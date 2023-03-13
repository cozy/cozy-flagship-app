import { cirrusCss } from '/screens/login/components/assets/common/css/cssCirrus'
import { cozyBsCss } from '/screens/login/components/assets/common/css/cssCozyBs'
import { getDimensions } from '/libs/dimensions'
import { themeCss } from '/screens/login/components/assets/common/css/cssTheme'

import { getLocalFonts } from './getLocalFonts'

const makeDOM = ({ body, isInverted }) => {
  const { navbarHeight, statusBarHeight } = getDimensions()

  const theme = isInverted ? 'theme-inverted' : ''

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="theme-color" content="#fff">
      <style type="text/css">${getLocalFonts()}</style>
      <style type="text/css">${cozyBsCss}</style>
      <style type="text/css">${themeCss}</style>
      <style type="text/css">${cirrusCss}</style>
    </head>

    <body class="${theme}" style="padding-top: ${statusBarHeight}px; padding-bottom: ${navbarHeight}px;">
      <main class="wrapper">
        ${body}
      </main>
    </body>
  </html>
`
}

export const makeHTML = body => {
  return makeDOM({ body, isInverted: false })
}

export const makeInvertedHTML = body => {
  return makeDOM({ body, isInverted: true })
}
