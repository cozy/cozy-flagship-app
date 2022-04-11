import ContentScript from '../../connectorLibs/ContentScript'
import Minilog from '@cozy/minilog'

const log = Minilog('ContentScript')
Minilog.enable()

const BASE_URL = 'https://takeout.google.com'
const FIRST_LOAD_URL = 'https://takeout.google.com?firstload'

class GoogleContentScript extends ContentScript {
  /////////
  //PILOT//
  /////////
  async ensureAuthenticated() {
    await this.goto(BASE_URL)

    // TODO check if authenticated
    await this.waitForUserAuthentication()
    return true
  }

  async waitForUserAuthentication() {
    log.debug('waitForUserAuthentication start')
    await this.setWorkerState({visible: true, url: BASE_URL})
    await this.runInWorkerUntilTrue({method: 'waitForAuthenticated'})
    await this.setWorkerState({visible: false})
  }

  async getUserDataFromWebsite() {
    return {
      sourceAccountIdentifier: 'default google source account identifier',
    }
  }

  checkUncheckedCheckBoxes() {
    const checkBoxSelector = 'input[type=checkbox]'
    const notCheckedCheckboxes = Array.from(
      document.querySelectorAll(checkBoxSelector),
    ).filter(elem => {
      return !elem.checked
    })

    for (const elem of notCheckedCheckboxes) {
      elem.click()
    }
  }

  findAbortExportButton() {
    const labels = ['Cancel export', "Annuler l'exportation"]
    const selector = 'button > span'
    const button = Array.from(document.querySelectorAll(selector)).find(elem =>
      labels.includes(elem.innerHTML),
    )
    return button
  }

  findNextButton() {
    const labels = ['Étape suivante', 'Next step']
    let button = null
    for (const label of labels) {
      const elem = document.querySelector(`[aria-label='${label}']`)
      if (elem) {
        button = elem
      }
    }
    return button
  }

  findCreateButton() {
    const labels = ['Create export', 'Créer une exportation']
    const selector = 'button > span'
    const button = Array.from(document.querySelectorAll(selector)).find(elem =>
      labels.includes(elem.innerHTML),
    )
    return button
  }

  async fetch() {
    await this.setWorkerState({visible: true, url: BASE_URL})
    const checkBoxSelector = 'input[type=checkbox]'
    this.log('waiting for checkboxes')
    await this.waitForElementInWorker(checkBoxSelector)
    this.log('found checkboxes')

    await this.runInWorker('triggerExport')
    await sleep(10)
  }

  //////////
  //WORKER//
  //////////
  async checkAuthenticated() {
    // return false
    const result =
      document.location.href.includes('https://takeout.google.com') &&
      document.location.href !== FIRST_LOAD_URL

    return result
  }

  async triggerExport() {
    const abortExportButton = this.findAbortExportButton()
    if (!abortExportButton) {
      this.checkUncheckedCheckBoxes()
      this.log('checked unchecked checkboxes')
      const nextButton = this.findNextButton()
      if (!nextButton) {
        this.log('ERROR Could not find next button')
        return
      }
      nextButton.click()
      this.log('clicked next button')

      const createButton = this.findCreateButton()
      if (!createButton) {
        this.log('ERROR Could not find create button')
        return
      }
      createButton.click()
      this.log('clicked create button')

      await sleep(5)
      window.location.reload()

      return true
    } else {
      this.log('An export is already in progress')
      return
    }
  }
}

const connector = new GoogleContentScript()
connector
  .init({
    additionalExposedMethodsNames: ['triggerExport'],
  })
  .catch(err => {
    console.warn(err)
  })

function sleep(delay) {
  return new Promise(function (resolve) {
    setTimeout(resolve, delay * 1000)
  })
}
