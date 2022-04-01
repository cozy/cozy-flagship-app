/***************************************************************/
/* This code should reflect cozy-stack/assets/scripts/login.js */
/***************************************************************/

export const loginJs = `
function postMessage (message) {
  if (window.ReactNativeWebView.postMessage === undefined) {
    setTimeout(postMessage, 200, message)
  } else {
    window.ReactNativeWebView.postMessage(message)
  }
}

;(function (w, d) {
  if (!w.fetch || !w.Headers) return

  const loginForm = d.getElementById('login-form')
  const passphraseInput = d.getElementById('password')
  const submitButton = d.getElementById('login-submit')

  const onSubmitPassphrase = function (event) {
    event.preventDefault()
    passphraseInput.setAttribute('disabled', true)
    submitButton.setAttribute('disabled', true)

    const passphrase = passphraseInput.value

    postMessage(JSON.stringify({
      message: 'setPassphrase',
      passphrase: passphrase
    }))
  }

  loginForm.addEventListener('submit', onSubmitPassphrase)
  passphraseInput.focus()
  submitButton.removeAttribute('disabled')
})(window, document)
`
