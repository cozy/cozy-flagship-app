/********************************************************************/
/* This code should reflect cozy-stack/assets/templates/login.html */
/********************************************************************/

import { newPasswordJs } from './js/jsNewPassword'
import { passwordStrengthJs } from './js/jsPasswordStrength'
import { passwordHelperJs } from '../PasswordView/js/jsPasswordHelper'
import { passwordVisibilityJs } from '../PasswordView/js/jsPasswordVisibility'
import { cirrusCss } from '../common/css/cssCirrus'
import { cozyBsCss } from '../common/css/cssCozyBs'
import { fontsCss } from '../common/css/cssFonts'
import { themeCss } from '../common/css/cssTheme'
import { cirrusJs } from '../common/js/jsCirrus'
import { readonlyJs } from '../common/js/jsReadonly'

import { cssPadding } from '/screens/login/components/functions/webViewPaddingInjection'

const strBackButton = "Revenir à l'écran précédent"
const strTitle = 'Choisir un mot de passe'
const strPasswordField = 'Mot de passe'
const strPasswordHelp =
  'Utiliser au moins huit caractères avec des lettres, des chiffres et des symboles.'
const strPasswordError = 'Votre mot de passe est trop court !'
const strPasswordHide = 'Cacher le mot de passe'
const strPasswordShow = 'Afficher le mot de passe'
const strHintField = 'Laisser un indice'
const strHintHelp =
  "L'indice vous sera envoyé par email en cas d'oubli de votre mot de passe, choisissez un indice que vous seul pourrez comprendre."
const strHintError = 'Votre indice doit être différent de votre mot de passe !'
const strSubmit = 'ENREGISTRER'

const getCredentialsErrorJs = (credentialsErrorMsg?: string): string =>
  credentialsErrorMsg
    ? `
      <script>
        const loginField = document.getElementById('password-field')
        window.showError(loginField, '${credentialsErrorMsg}')
      </script>
    `
    : ''

const locale = 'fr'

export const getHtml = (
  instance: string,
  credentialsErrorMsg?: string
): string => `
<!DOCTYPE html>
<html lang${locale}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#fff">
    <style type="text/css">${fontsCss(instance)}</style>
    <style type="text/css">${cozyBsCss}</style>
    <style type="text/css">${themeCss}</style>
    <style type="text/css">${cirrusCss}</style>
    <style type="text/css">${cssPadding}</style>
  </head>
  <body class="theme-inverted">
    <form id="new-pass-form" method="POST" action="#" class="d-contents" data-salt="{{.Salt}}" data-hint-error="${strHintError}" data-pass-error="${strPasswordError}">
      <input type="hidden" id="iterations" name="iterations" value="{{.Iterations}}" />
      <main class="wrapper">

        <header class="wrapper-top">
          <a href="#" id="backButton" class="btn btn-icon" aria-label="${strBackButton}">
            <span class="icon icon-back"></span>
          </a>
        </header>

        <div class="d-flex flex-column align-items-center">
          <h1 class="h4 h2-md mb-4 mb-md-5 text-center">${strTitle}</h1>
          <div id="password-field" class="input-group form-floating has-validation mb-2 w-100">
            <input type="password" class="form-control form-control-md-lg" id="password" name="passphrase" autofocus autocomplete="new-password" />
            <label for="password">${strPasswordField}</label>
            <button id="password-visibility-button" class="btn btn-outline-info"
              type="button"
              name="password-visibility"
              data-show="${strPasswordShow}"
              data-hide="${strPasswordHide}"
              title="${strPasswordShow}">
              <span id="password-visibility-icon" class="icon icon-eye-closed"></span>
            </button>
            <div class="progress">
              <div id="password-strength" class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </div>
          <p id="password-tip" class="text-muted mb-3">${strPasswordHelp}</p>

          <div id="password-hint">
            <div id="hint-field" class="input-group form-floating has-validation w-100 mb-2">
              <input type="text" class="form-control form-control-md-lg" id="hint" name="hint" />
              <label for="hint">${strHintField}</label>
            </div>
            <p class="text-muted">${strHintHelp}</p>
          </div>
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
    <script>${passwordStrengthJs}</script>
    <script>${newPasswordJs}</script>
    ${getCredentialsErrorJs(credentialsErrorMsg)}
    <script>
      window.addEventListener("load", function(event) {
        postMessage(JSON.stringify({message: 'loaded'}))

        document.getElementById('backButton').onclick = () => {
          postMessage(JSON.stringify({
            message: 'backButton'
          }))

          return false
        }
      })
      ${readonlyJs(['login-submit', 'password-field', 'hint-field'])}
    </script>
  </body>
</html>
`
