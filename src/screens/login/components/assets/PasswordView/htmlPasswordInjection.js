/*******************************************************************/
/* This code should reflect cozy-stack/assets/templates/login.html */
/*******************************************************************/

import {loginJs} from './js/jsLogin'
import {cirrusJs} from '../common/js/jsCirrus'
import {passwordHelperJs} from './js/jsPasswordHelper'
import {passwordVisibilityJs} from './js/jsPasswordVisibility'

import {cirrusCss} from '../common/css/cssCirrus'
import {fontsCss} from '../common/css/cssFonts'
import {cozyBsCss} from '../common/css/cssCozyBs'
import {themeCss} from '../common/css/cssTheme'

const strBackButton = "Revenir à l'écran précédent"
const strPasswordField = 'Mot de passe'
const strPasswordHide = 'Cacher le mot de passe'
const strPasswordShow = 'Afficher le mot de passe'
const strForgotPassword = "J'ai oublié mon mot de passe"
const strSubmit = 'SE CONNECTER'

const getCredentialsErrorJs = credentialsErrorMsg =>
  credentialsErrorMsg
    ? `
      <script>
        const loginField = document.getElementById('login-field')
        window.showError(loginField, '${credentialsErrorMsg}')
      </script>
    `
    : ''

const locale = 'fr'

export const getHtml = (
  title,
  fqdn,
  instance,
  credentialsErrorMsg = undefined,
) => `
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
          <img src="${instance}/public/avatar" alt="" id="avatar" class="avatar my-3 border border-primary border-2 rounded-circle" style="box-sizing: content-box;" />
          <h1 class="h4 h2-md mb-0 text-center">${title}</h1>
          <p class="mb-4 mb-md-5 text-muted">${fqdn}</p>
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
    ${getCredentialsErrorJs(credentialsErrorMsg)}
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
    </script>
  </body>
</html>
`
