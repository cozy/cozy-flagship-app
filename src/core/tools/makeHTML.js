import { cirrusCss } from '/screens/login/components/assets/common/css/cssCirrus'
import { cozyBsCss } from '/screens/login/components/assets/common/css/cssCozyBs'
import { fontsCss } from '/screens/login/components/assets/common/css/cssFonts'
import { getDimensions } from '../services/Device/dimensions'
import { themeCss } from '/screens/login/components/assets/common/css/cssTheme'

export const makeHTML = body => {
  const { navbarHeight, statusBarHeight } = getDimensions()

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="theme-color" content="#fff">
      <style type="text/css">${fontsCss('https://localhost')}</style>
      <style type="text/css">${cozyBsCss}</style>
      <style type="text/css">${themeCss}</style>
      <style type="text/css">${cirrusCss}</style>
    </head>

    <body class="theme-inverted" style="padding-top: ${statusBarHeight}px; padding-bottom: ${navbarHeight}px;">
      <main class="wrapper">
        ${body}
      </main>
    </body>
  </html>
`
}
