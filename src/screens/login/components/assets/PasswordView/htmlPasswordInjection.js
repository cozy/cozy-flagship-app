/********************************************************************/
/* This code should reflect cozy-stack/assets/templates/login.html */
/********************************************************************/

import { encode } from 'html-entities'

import { handleErrorMessage } from './js/jsHandleErrorMessage'
import { loginJs } from './js/jsLogin'
import { passwordHelperJs } from './js/jsPasswordHelper'
import { passwordVisibilityJs } from './js/jsPasswordVisibility'
import { cirrusCss } from '../common/css/cssCirrus'
import { cozyBsCss } from '../common/css/cssCozyBs'
import { fontsCss } from '../common/css/cssFonts'
import { themeCss } from '../common/css/cssTheme'
import { cirrusJs } from '../common/js/jsCirrus'
import { readonlyJs } from '../common/js/jsReadonly'

const strBackButton = "Revenir à l'écran précédent"
const strPasswordField = 'Mot de passe'
const strPasswordHide = 'Cacher le mot de passe'
const strPasswordShow = 'Afficher le mot de passe'
const strForgotPassword = "J'ai oublié mon mot de passe"
const strSubmit = 'SE CONNECTER'

const locale = 'fr'

/**
 * Generate password specific HTML to provide to webview
 *
 * @param {string} title - The title of the page - for example the user's name as configured in the Cozy's settings
 * @param {string} fqdn - The subtitle of the page - for example the Cozy's fqdn
 * @param {string} instance - The Cozy's url, used to get avatar and fonts css
 * @returns {Element} HTML of Password form to inject inside Webview
 */
export const getHtml = (title, fqdn, instance) => {
  const avatarUrl = new URL(instance)
  avatarUrl.pathname = 'public/avatar'

  const avatarSvgUrl =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNCA0KSI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTAuNDM2NSAxMC4wMDFDMTAuMzE5IDEwLjE4NCAxMC4wNTg1IDEwLjIzOSA5Ljg3ODk5IDEwLjExOUM5Ljg2MzQ5IDEwLjEwOTUgOS44NDg0OSAxMC4wOTkgOS44MzQ0OSAxMC4wODg1QzkuMzEwOTkgMTAuNDk5IDguNjY2NDkgMTAuNzIzIDcuOTk2NDkgMTAuNzIzQzcuMzI3OTkgMTAuNzIzIDYuNjg0OTkgMTAuNSA2LjE2MjQ5IDEwLjA5MUM2LjE0ODk5IDEwLjEwMDUgNi4xMzU0OSAxMC4xMTA1IDYuMTIxNDkgMTAuMTE5QzUuOTM2NDkgMTAuMjM5NSA1LjY3OTk5IDEwLjE4MiA1LjU2MzQ5IDEwLjAwMjVDNS40NDU0OSA5LjgyMDQ4IDUuNDk2OTkgOS41NzM5OCA1LjY3Nzk5IDkuNDUyNDhDNS44MzQ5OSA5LjM0ODk4IDUuODQ1OTkgOS4xNDA0OCA1Ljg0NTk5IDkuMTQwNDhDNS44NDk5OSA5LjAzMjQ5IDUuODk2OTkgOC45Mjk0OCA1Ljk3NTQ5IDguODU2OThDNi4wNTM0OSA4Ljc4NDQ4IDYuMTUxNDkgOC43NDI0OCA2LjI1OTQ5IDguNzUwOThDNi40NzU5OSA4Ljc1NTk4IDYuNjUxOTkgOC45Mzc5OCA2LjY0Nzk5IDkuMTU2OThDNi42NDc5OSA5LjE1OTk4IDYuNjQ3NDkgOS4yNjk0OCA2LjYwNzk5IDkuNDIxNDhDNy40MTU0OSAxMC4wOTIgOC41ODU5OSAxMC4wODk1IDkuMzkwNDkgOS40MTU5OEM5LjM2MDk5IDkuMjk5NDggOS4zNTM0OSA5LjIwNjQ4IDkuMzUxNDkgOS4xNjM0OEM5LjM0OTQ5IDkuMDUwOTggOS4zODk0OSA4Ljk0ODk4IDkuNDY0OTkgOC44NzE0OEM5LjUzODk5IDguNzk1NDggOS42Mzg5OSA4Ljc1MjQ4IDkuNzQ1NDkgOC43NTA0OEg5Ljc1MjQ5QzkuOTY4OTkgOC43NTA0OCAxMC4xNDg1IDguOTI0OTggMTAuMTUzNSA5LjE0MTk4QzEwLjE1MzUgOS4xNDE5OCAxMC4xNjUgOS4zNDk0OCAxMC4zMjA1IDkuNDUxOThDMTAuNTAyNSA5LjU3MTk4IDEwLjU1NDUgOS44MTc0OCAxMC40MzY1IDEwLjAwMVpNMTIuMTQ0IDUuMzE4QzEyLjAyODUgNC4zNDEgMTEuNTk2IDMuNDM4IDEwLjkwMTUgMi43NEMxMC4xMDUgMS45Mzk1IDkuMDUyNSAxLjUgNy45Mzg1IDEuNUM2LjgyNDUgMS41IDUuNzcyNSAxLjkzOTUgNC45NzYgMi43NDA1QzQuMjc4NSAzLjQ0MSAzLjg0NSA0LjM0OSAzLjczMiA1LjMzMTVDMi43NzU1IDUuNDQ3NSAxLjg5MSA1Ljg5MyAxLjIwOCA2LjYwODVDMC40MjkgNy40MjYgMCA4LjUwNjUgMCA5LjY1MDVDMCAxMi4wNDkgMS45IDE0IDQuMjM2NSAxNEgxMS43NjNDMTQuMDk4NSAxNCAxNiAxMi4wNDkgMTYgOS42NTA1QzE2IDcuMzg0IDE0LjMwMiA1LjUxNjUgMTIuMTQ0IDUuMzE4WiIgZmlsbD0iI0ZGRkZGRiIgLz4KPC9nPgo8L3N2Zz4K'

  return `
<!DOCTYPE html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#fff">
    <style type="text/css">${fontsCss(instance)}</style>
    <style type="text/css">${cozyBsCss}</style>
    <style type="text/css">${themeCss}</style>
    <style type="text/css">${cirrusCss}</style>
  </head>
  <body class="theme-inverted">
    <form id="login-form" method="POST" action="#" class="d-contents">
      <input id="trusted-device-token" type="hidden" name="trusted-device-token" value="" />
      <main class="wrapper">

        <header class="wrapper-top">
          <a href="#" id="backButton" class="btn btn-icon" aria-label="${strBackButton}">
            <span class="icon icon-back"></span>
          </a>
        </header>

        <div class="d-flex flex-column align-items-center">
          <img src="${avatarSvgUrl}" alt="" id="avatar" class="avatar my-3 border border-primary border-2 rounded-circle" style="box-sizing: content-box;" />
          <h1 class="h4 h2-md mb-0 text-center">${encode(title)}</h1>
          <p class="mb-4 mb-md-5 text-muted">${encode(fqdn)}</p>
          <div id="login-field" class="input-group form-floating has-validation w-100">
            <input type="password" class="form-control form-control-md-lg" id="password" name="passphrase" autofocus autocomplete="current-password" />
            <label for="password">${strPasswordField}</label>
            <button id="password-visibility-button" class="btn btn-outline-info"
              type="button"
              name="password-visibility"
              data-show="${strPasswordShow}"
              data-hide="${strPasswordHide}"
              title="${strPasswordShow}">
              <span id="password-visibility-icon" class="icon icon-eye-closed"></span>
            </button>
          </div>
          <a href="#" id="forgotPassLink" class="align-self-start my-3">
            ${strForgotPassword}
          </a>
        </div>

        <footer class="w-100">
          <button id="login-submit" class="btn btn-primary btn-md-lg w-100 my-3 mt-md-5" type="submit">
            ${strSubmit}
          </button>
        </footer>

      </main>
    </form>
    <script>${cirrusJs}</script>
    <script>${passwordHelperJs}</script>
    <script>${passwordVisibilityJs}</script>
    <script>${loginJs}</script>
    <script>
      function sendLoadedEvent() {
        setTimeout(() => {
          const avatarImg = document.getElementById('avatar')
          const avatarPosition = avatarImg.getBoundingClientRect()
          const height = avatarImg.clientHeight
          const width = avatarImg.clientWidth

          postMessage(JSON.stringify({
            message: 'loaded',
            avatarPosition: {
              top: avatarPosition.top,
              left: avatarPosition.left,
              height: height,
              width: width,
              boxHeight: avatarPosition.height,
              boxWidth: avatarPosition.width,
            }
          }))
        }, 100)
      }

      window.addEventListener("load", function(event) {
        var img = document.getElementById('avatar')

        if (img.complete) {
          sendLoadedEvent()
        } else {
          img.addEventListener('load', sendLoadedEvent)
          img.addEventListener('error', function() {
            alert('error')
          })
        }

        document.getElementById('forgotPassLink').onclick = () => {
          postMessage(JSON.stringify({
            message: 'forgotPassword'
          }))

          return false
        }

        document.getElementById('backButton').onclick = () => {
          postMessage(JSON.stringify({
            message: 'backButton'
          }))

          return false
        }
      })

      ${handleErrorMessage()}
      ${readonlyJs(['login-submit', 'password'])}
    </script>
  </body>
</html>
`
}
