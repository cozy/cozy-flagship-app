import { cirrusCss } from '/screens/login/components/assets/common/css/cssCirrus'
import { cozyBsCss } from '/screens/login/components/assets/common/css/cssCozyBs'
import { fontsCss } from '/screens/login/components/assets/common/css/cssFonts'
import { getDimensions } from '/libs/dimensions'
import { themeCss } from '/screens/login/components/assets/common/css/cssTheme'
import { translation } from '/locales'

const headerTemplate = `
  <button id="backButton" class="btn btn-icon">
    <span class="icon icon-back"></span>
  </button>
`

const footerTemplate = `
  <p class="text-center mb-3">
    ${translation.errors.contactUs} <a id="mailto" href="#">contact@cozycloud.cc</a>.
  </p>
`

export const makeErrorPage = ({ icon, title, body, footer, header }) => {
  const dimensions = getDimensions()
  const navbarHeight = dimensions.navbarHeight
  const statusBarHeight = dimensions.statusBarHeight

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
        <header class="wrapper-top d-flex flex-row align-items-center">${
          header ? headerTemplate : ''
        }</header>

        <div class="d-flex flex-column align-items-center mb-md-3">
          <div class="mb-3">${icon}</div>
          <h1 class="h4 h2-md mb-3 text-center">${title}</h1>
          <p class="text-center">${body}</p>
        </div>

        <footer>${footer ? footerTemplate : ''}</footer>
      </main>

      <script>
        window.addEventListener("load", function(event) {
          document.getElementById('backButton').onclick = () => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              message: 'backButton'
            }))
          }

          document.getElementById('mailto').onclick = (e) => {
            e.preventDefault();

            window.ReactNativeWebView.postMessage(JSON.stringify({
              message: 'mailto'
            }))
          }
        })
      </script>
    </body>
  </html>
`
}
