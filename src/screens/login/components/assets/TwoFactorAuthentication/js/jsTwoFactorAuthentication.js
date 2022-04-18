/********************************************************************/
/* This code should reflect cozy-stack/assets/scripts/twofactor.js */
/********************************************************************/

export const twoFactorAuthenticationJs = `
function postMessage (message) {
  if (window.ReactNativeWebView.postMessage === undefined) {
    setTimeout(postMessage, 200, message)
  } else {
    window.ReactNativeWebView.postMessage(message)
  }
}

;(function (w, d) {
  if (!w.fetch || !w.Headers) return

  const twofaForm = d.getElementById('two-factor-form')
  const twofaField = d.getElementById('two-factor-field')
  const submitButton = d.getElementById('two-factor-submit')
  const passcodeInput = d.getElementById('two-factor-passcode')

  const onSubmitTwoFactorCode = function (event) {
    event.preventDefault()

    passcodeInput.setAttribute('disabled', true)
    submitButton.setAttribute('disabled', true)

    const passcode = passcodeInput.value

    postMessage(JSON.stringify({
      message: 'setTwoFactorAuthenticationCode',
      twoFactorAuthenticationCode: passcodeInput.value
    }))
  }

  twofaForm.addEventListener('submit', onSubmitTwoFactorCode)
})(window, document)
`
