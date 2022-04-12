import ContentScript from '../../connectorLibs/ContentScript'
import Minilog from '@cozy/minilog'

const log = Minilog('ContentScript')
Minilog.enable()

const BASE_URL = 'https://takeout.google.com'
const FIRST_LOAD_URL = 'https://takeout.google.com?firstload'

const DEFAULT_SOURCE_ACCOUNT_IDENTIFIER = 'google-takeout'

class GoogleContentScript extends ContentScript {
  /////////
  //PILOT//
  /////////
  async ensureAuthenticated() {
    await this.goto(BASE_URL)

    await this.waitForUserAuthentication()
    return true
  }

  async waitForUserAuthentication() {
    log.debug('waitForUserAuthentication start')
    await this.setWorkerState({visible: true, url: BASE_URL})
    await this.runInWorkerUntilTrue({method: 'waitForAuthenticated'})
    await this.setWorkerState({visible: false, url: BASE_URL})
  }

  async getUserDataFromWebsite() {
    // I think that if we cannot find the user mail, this should not be an connector execution
    // error
    return {
      sourceAccountIdentifier:
        (await this.runInWorker('getUserMail')) ||
        DEFAULT_SOURCE_ACCOUNT_IDENTIFIER,
    }
  }

  async getUserMail() {
    // Only unique way I found to get the user email
    const result = document
      .querySelector("a[href*='https://accounts.google.com']")
      .getAttribute('aria-label')
      .match(/\((.*)\)/)
    if (result) {
      return result[1]
    }
    return false
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

  findExportInProgress() {
    const inProgress = document.querySelector('[data-in-progress=true]')
    return Boolean(inProgress)
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
    await this.setWorkerState({url: BASE_URL})
    const checkBoxSelector = 'input[type=checkbox]'
    this.log('waiting for checkboxes')
    await this.waitForElementInWorker(checkBoxSelector)
    this.log('found checkboxes')

    const status = await this.runInWorker('triggerExport')
    if (status) {
      throw new Error(status)
    }
  }

  //////////
  //WORKER//
  //////////
  async checkAuthenticated() {
    const result =
      document.location.href.includes('https://takeout.google.com') &&
      document.location.href !== FIRST_LOAD_URL

    return result
  }

  async triggerExport() {
    const isInProgress = this.findExportInProgress()
    if (!isInProgress) {
      this.checkUncheckedCheckBoxes()
      this.log('checked unchecked checkboxes')
      const nextButton = this.findNextButton()
      if (!nextButton) {
        this.log('ERROR Could not find next button')
        return 'VENDOR_DOWN'
      }
      nextButton.click()
      this.log('clicked next button')

      const createButton = this.findCreateButton()
      if (!createButton) {
        this.log('ERROR Could not find create button')
        return 'VENDOR_DOWN'
      }
      createButton.click()
      this.log('clicked create button')

      await sleep(5)
      window.location.reload()
      if (!this.findExportInProgress()) {
        this.log('ERROR Could not find abort button')
        return 'VENDOR_DOWN'
      }
      return
    } else {
      this.log('An export is already in progress')
      return
    }
  }
}

const connector = new GoogleContentScript()
connector
  .init({
    additionalExposedMethodsNames: ['triggerExport', 'getUserMail'],
  })
  .catch(err => {
    console.warn(err)
  })

function sleep(delay) {
  return new Promise(function (resolve) {
    setTimeout(resolve, delay * 1000)
  })
}
