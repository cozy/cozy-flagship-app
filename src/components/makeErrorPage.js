import { fontsCss } from '../screens/login/components/assets/common/css/cssFonts'
import { cozyBsCss } from '../screens/login/components/assets/common/css/cssCozyBs'
import { themeCss } from '../screens/login/components/assets/common/css/cssTheme'
import { cirrusCss } from '../screens/login/components/assets/common/css/cssCirrus'

export const makeErrorPage = ({ icon, title, body }) => `
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
    <body class="theme-inverted">
      <main class="wrapper justify-content-center">
        <div class="d-flex flex-column align-items-center">
          <div class="mb-3">${icon}</div>
          <h1 class="h4 h2-md mb-3 text-center">${title}</h1>
          <p class="text-center">${body}</p>
        </div>
      </main>
    </body>
  </html>
`
