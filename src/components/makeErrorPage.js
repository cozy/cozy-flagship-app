import { cirrusCss } from '/screens/login/components/assets/common/css/cssCirrus'
import { cozyBsCss } from '/screens/login/components/assets/common/css/cssCozyBs'
import { getDimensions } from '/libs/dimensions'
import { themeCss } from '/screens/login/components/assets/common/css/cssTheme'
import { translation } from '/locales'

import { getLocalFonts } from './getLocalFonts'

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

const resetTemplate = `
  <button id="resetButton" class="btn btn-primary mt-3 mb-2">
    ${translation.errors.reset}
  </button>
`

export const makeErrorPage = ({ icon, title, body, footer, header, reset }) => {
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
      <style type="text/css">${getLocalFonts()}</style>
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
          ${reset ? resetTemplate : ''}
        </div>

        <footer>${footer ? footerTemplate : ''}</footer>
      </main>

      <script>
        window.addEventListener("load", function(event) {
          const backButton = document.getElementById('mailto')
          if (backButton) {
            backButton.onclick = () => {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                message: 'backButton'
              }))
            }
          }

          const mailToLink = document.getElementById('mailto')
          if (mailToLink) {
            mailToLink.onclick = (e) => {
              e.preventDefault();
  
              window.ReactNativeWebView.postMessage(JSON.stringify({
                message: 'mailto'
              }))
            }
          }

          const resetButton = document.getElementById('resetButton')
          if (resetButton) {
            resetButton.onclick = (e) => {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                message: 'reset'
              }))
            }
          }
        })
      </script>
    </body>
  </html>
`
}
