/***********************************************************************/
/* This code should reflect cozy-stack/assets/scripts/new-password.js */
/***********************************************************************/

export const newPasswordJs = `
function postMessage (message) {
  if (window.ReactNativeWebView.postMessage === undefined) {
    setTimeout(postMessage, 200, message)
  } else {
    window.ReactNativeWebView.postMessage(message)
  }
}

;(function (w, d) {
  if (!w.fetch || !w.Headers) return

  const form = d.getElementById('new-pass-form')
  const passField = d.getElementById('password-field')
  const passInput = d.getElementById('password')
  const hintField = d.getElementById('hint-field')
  const hintInput = d.getElementById('hint')
  const strength = d.getElementById('password-strength')
  const submit = form.querySelector('[type=submit]')

  form.addEventListener('submit', function (event) {
    event.preventDefault()

    const pass = passInput.value
    const hint = hintInput.value
    const salt = form.dataset.salt

    const tooltips = form.querySelectorAll('.invalid-tooltip')
    for (const tooltip of tooltips) {
      tooltip.classList.add('d-none')
    }

    if (hint === pass) {
      w.showError(hintField, form.dataset.hintError)
      return
    }

    if (strength.classList.contains('pass-weak') || !pass) {
      w.showError(passField, form.dataset.passError)
      return
    }

    submit.setAttribute('disabled', true)

    postMessage(JSON.stringify({
      message: 'setPassphrase',
      passphrase: pass,
      hint: hint
    }))
  })

  submit.removeAttribute('disabled')
})(window, document)
`
