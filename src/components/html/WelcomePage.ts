import { getLogoSvg } from '/ui/Logo/logo'
import { getColors } from '/ui/colors'
import { t } from '/locales/i18n'

const colors = getColors()

const body = `
  <div class="d-flex flex-grow-1 flex-column justify-content-center text-center">
    <div class="mb-4">
      ${getLogoSvg({
        backgroundColor: colors.primaryColor,
        foregroundColor: colors.paperBackgroundColor
      })}
    </div>

    <div class="h2 mb-3">${t('screens.welcome.title')}</div>

    <div class="mx-5">${t('screens.welcome.body')}</div>
  </div>

  <button class="btn btn-primary mt-3 mb-2" onclick="(() => window.ReactNativeWebView.postMessage('onSignin'))()">
    ${t('screens.welcome.buttonSignin')}
  </button>

  <button class="btn btn-outline-info mb-3" onclick="(() => window.ReactNativeWebView.postMessage('onLogin'))()">
    ${t('screens.welcome.buttonLogin')}
  </button>
`

export const WelcomePage = body
