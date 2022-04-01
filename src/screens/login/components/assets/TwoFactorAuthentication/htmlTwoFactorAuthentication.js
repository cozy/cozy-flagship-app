/***********************************************************************/
/* This code should reflect cozy-stack/assets/templates/twofactor.html */
/***********************************************************************/

import {twoFactorAuthenticationJs} from './js/jsTwoFactorAuthentication'
import {cirrusJs} from '../common/js/jsCirrus'

import {cirrusCss} from '../common/css/cssCirrus'
import {fontsCss} from '../common/css/cssFonts'
import {cozyBsCss} from '../common/css/cssCozyBs'
import {themeCss} from '../common/css/cssTheme'

const strBackButton = "Revenir à l'écran précédent"
const strLoginTwoFactorTitle = 'Authentification en 2 étapes'
const strLoginTwoFactorHelp =
  'Entrer le code de vérification qui vient de vous être envoyé par mail'
const strLoginTwoFactorField = 'Code (6 chiffres)'
const strSubmit = 'CONFIRMER'

const getCredentialsErrorJs = credentialsErrorMsg =>
  credentialsErrorMsg
    ? `
      <script>
        const twofaField = document.getElementById('two-factor-field')
        window.showError(twofaField, "${credentialsErrorMsg}")
      </script>
    `
    : ''

const locale = 'fr'

export const getHtml = (instance, credentialsErrorMsg = undefined) => `
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
    <form id="two-factor-form" method="POST" action="#" class="d-contents">
      <main class="wrapper">

        <header class="wrapper-top d-flex flex-row align-items-center">
          <a href="#" id="backButton" class="btn btn-icon" aria-label="${strBackButton}">
            <span class="icon icon-back"></span>
          </a>
        </header>

        <div class="d-flex flex-column align-items-center">
          <h1 class="h4 h2-md mb-3 text-center">${strLoginTwoFactorTitle}</h1>
          <p class="mb-4 mb-md-5 text-center">${strLoginTwoFactorHelp}</p>
          <div id="two-factor-field" class="form-floating has-validation w-100 mb-3">
            <input type="text" class="form-control form-control-md-lg" id="two-factor-passcode" name="two-factor-passcode" autofocus autocomplete="one-time-code" pattern="[0-9]*" inputmode="numeric" maxlength="6" />
            <label for="two-factor-passcode">${strLoginTwoFactorField}</label>
          </div>
        </div>

        <footer class="w-100">
          <button id="two-factor-submit" class="btn btn-primary btn-md-lg w-100 my-3 mt-md-5" type="submit">
            ${strSubmit}
          </button>
        </footer>

      </main>
    </form>
    <script>${cirrusJs}</script>
    <script>${twoFactorAuthenticationJs}</script>
    ${getCredentialsErrorJs(credentialsErrorMsg)}
    <script>
      window.addEventListener("load", function(event) {
        postMessage(JSON.stringify({
          message: 'loaded',
        }))
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
