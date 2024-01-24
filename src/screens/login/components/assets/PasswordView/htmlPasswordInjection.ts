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

import { getDimensions } from '/libs/dimensions'
import type { ClouderyTheme } from '/screens/login/components/functions/clouderyThemeFetcher'
import { cssPadding } from '/screens/login/components/functions/webViewPaddingInjection'
import { getAvatarDataUri } from '/ui/Logo/avatar'

const strBackButton = "Revenir à l'écran précédent"
const strPasswordField = 'Mot de passe'
const strPasswordHide = 'Cacher le mot de passe'
const strPasswordShow = 'Afficher le mot de passe'
const strForgotPassword = "J'ai oublié mon mot de passe"
const strSubmit = 'SE CONNECTER'

const locale = 'fr'

console.log('💜 getDimensions() from PasswordView')
const dimensions = getDimensions()

const getCustomThemeLink = (clouderyTheme: ClouderyTheme): string =>
  clouderyTheme.themeUrl
    ? `<link rel="stylesheet" media="screen" href="${clouderyTheme.themeUrl}">`
    : ''

/**
 * Generate password specific HTML to provide to webview
 *
 * @param {string} title - The title of the page - for example the user's name as configured in the Cozy's settings
 * @param {string} fqdn - The subtitle of the page - for example the Cozy's fqdn
 * @param {string} instance - The Cozy's url, used to get avatar and fonts css
 * @param {string} backgroundColor - The LoginScreen's background color (used for overlay and navigation bars)
 * @returns {string} HTML of Password form to inject inside Webview
 */
export const getHtml = (
  title: string,
  fqdn: string,
  instance: string,
  clouderyTheme: ClouderyTheme
): string => {
  const avatarUrl = new URL(instance)
  avatarUrl.pathname = 'public/avatar'

  const avatarSvgUrl = getAvatarDataUri()

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
    <style type="text/css">${cssPadding}</style>
    ${getCustomThemeLink(clouderyTheme)}
  </head>
  <body class="cirrus theme-inverted">
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
              top: avatarPosition.top - ${dimensions.statusBarHeight},
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
