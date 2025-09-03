import { getLocalFonts } from '/components/getLocalFonts'
import { cirrusCss } from '/screens/login/components/assets/common/css/cssCirrus'
import { cozyBsCss } from '/screens/login/components/assets/common/css/cssCozyBs'
import { getDimensions } from '/libs/dimensions'
import { themeCss } from '/screens/login/components/assets/common/css/cssTheme'
import { t } from '/locales/i18n'

export enum Theme {
  light,
  inverted
}

export interface ErrorPageGeneratorArguments {
  backgroundColor?: string
  error?: {
    message: string
    details: string
  }
}

export type ErrorPageGenerator = ({
  backgroundColor,
  error
}: ErrorPageGeneratorArguments) => string

const headerTemplate = `
  <button id="backButton" class="btn btn-icon">
    <span class="icon icon-back"></span>
  </button>
`

const footerTemplate = `
  <p class="text-center mb-3">
    ${t('errors.contactUs')} <a id="mailto" href="#">support@twake.app</a>.
  </p>
`

const resetTemplate = `
  <button id="resetButton" class="btn btn-primary mt-3 mb-2">
    ${t('errors.reset')}
  </button>
`

const errorDetailsTemplate = `
  <button id="showDetails" class="btn btn-link mt-1">
    ${t('errors.showDetails')}
  </button>
`

interface MakeErrorPageProps {
  icon: string
  title: string
  body: string
  footer?: boolean
  header?: boolean
  reset?: boolean
  backgroundColor?: string
  errorDetails?: string
  theme?: Theme
}

export const makeHtmlErrorPage = ({
  icon,
  title,
  body,
  footer,
  header,
  reset,
  backgroundColor,
  errorDetails,
  theme = Theme.inverted
}: MakeErrorPageProps): string => {
  const dimensions = getDimensions()
  const navbarHeight = dimensions.navbarHeight
  const statusBarHeight = dimensions.statusBarHeight

  const themeString =
    theme === Theme.inverted ? 'theme-inverted' : 'theme-light'

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
      <style type="text/css">
      ${
        backgroundColor === '#4b4b4b'
          ? `
          .theme-inverted {
            --primaryColorDark: #eeeeee;
            --primaryColorLightest: #626262;
            --primaryTextContrastColor: #626262;
            --secondaryColor: #a3a3a3;
            --paperBackgroundColor: #4b4b4b;
            --banner-color: #282828;
            --btn-secondary-border-color: rgba(255, 255, 255, .48);
          }`
          : ''
      }
      </style>
    </head>

    <body class="${themeString}" style="padding-top: ${statusBarHeight}px; padding-bottom: ${navbarHeight}px;">
      <main class="wrapper">
        <header class="wrapper-top d-flex flex-row align-items-center">${
          header ? headerTemplate : ''
        }</header>

        <div class="d-flex flex-column align-items-center mb-md-3">
          <div class="mb-3">${icon}</div>
          <h1 class="h4 h2-md mb-3 text-center">${title}</h1>
          <p class="text-center">${body}</p>
          ${errorDetails ? errorDetailsTemplate : ''}
          ${reset ? resetTemplate : ''}
        </div>

        <footer>${footer ? footerTemplate : ''}</footer>
      </main>

      <script>
        window.addEventListener("load", function(event) {
          const backButton = document.getElementById('backButton')
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

          const showDetailsButton = document.getElementById('showDetails')
          if (showDetailsButton) {
            showDetailsButton.onclick = (e) => {
              window.alert(\`${errorDetails ?? 'no details'}\`)
            }
          }
        })
      </script>
    </body>
  </html>
`
}
