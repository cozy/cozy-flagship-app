import ContentScript from '../../connectorLibs/ContentScript'
import {kyScraper as ky, blobToBase64} from '../../connectorLibs/utils'
import Minilog from '@cozy/minilog'
// import get from 'lodash/get'
// import {format} from 'date-fns'
// import waitFor from 'p-wait-for'

const log = Minilog('ContentScript')
Minilog.enable()

const BASE_URL = 'https://espace-client.orange.fr'
const LOGIN_URL =
  'https://login.orange.fr/?service=nextecare&return_url=https%3A%2F%2Fespace-client.orange.fr%2Fpage-accueil#/password'
const DEFAULT_PAGE_URL = BASE_URL + '/accueil'
const DEFAULT_SOURCE_ACCOUNT_IDENTIFIER = 'orange'
let bills = []
let promises = []
let promisesToConvertBlobToBase64 = []

var proxied = window.XMLHttpRequest.prototype.open
window.XMLHttpRequest.prototype.open = function () {
  if (arguments[1].includes('/users/current/contracts')) {
    var originalResponse = this

    originalResponse.addEventListener('readystatechange', function (event) {
      console.log('event', event)
      if (originalResponse.readyState === 4) {
        console.log('response', originalResponse.responseText.split(','))
      }
    })
    return proxied.apply(this, [].slice.call(arguments))
  }
  if (
    arguments[1].includes('facture/v1.0/pdf?billDate') ||
    arguments[1].includes('ecd_wp/facture/historicPDF?')
  ) {
    var originalResponse = this
    promises.push(originalResponse)
    originalResponse.addEventListener('readystatechange', function (event) {
      // console.log('event', event)
      if (originalResponse.readyState === 4) {
        promisesToConvertBlobToBase64.push(
          blobToBase64(originalResponse.response),
        )
        return originalResponse
      }
    })
  }
  return proxied.apply(this, [].slice.call(arguments))
}

class OrangeContentScript extends ContentScript {
  /////////
  //PILOT//
  /////////

  async ensureAuthenticated() {
    await this.goto(DEFAULT_PAGE_URL)
    log.debug('waiting for any authentication confirmation or login form...')
    await Promise.race([
      this.runInWorkerUntilTrue({method: 'waitForAuthenticated'}),
      this.waitForElementInWorker('[data-e2e="e2e-ident-button"]'),
    ])
    this.log('After Race')
    if (await this.runInWorker('checkAuthenticated')) {
      this.log('Authenticated')
      return true
    } else {
      await this.waitForUserAuthentication()
      log.debug('Not authenticated')
      return true
    }
  }

  async waitForUserAuthentication() {
    log.debug('waitForUserAuthentication start')
    await this.setWorkerState({visible: true, url: DEFAULT_PAGE_URL})
    await this.runInWorkerUntilTrue({method: 'waitForAuthenticated'})
    await this.setWorkerState({visible: false, url: DEFAULT_PAGE_URL})
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

  async fetch(context) {
    log.debug('fetch start')
    log.debug('context', context)
    await this.waitForElementInWorker('a[class="ob1-link-icon ml-1 py-1"]')
    const clientRef = await this.runInWorker('findClientRef')
    if (clientRef) {
      this.log('clientRef founded')
      await this.setWorkerState({
        visible: false,
        url: `https://espace-client.orange.fr/facture-paiement/${clientRef}`,
      })
      await this.waitForElementInWorker('[data-e2e="bp-tile-historic"]')
      await this.setWorkerState({
        visible: false,
        url: `https://espace-client.orange.fr/facture-paiement/${clientRef}/historique-des-factures`,
      })
      await this.waitForElementInWorker(
        '[aria-labelledby="bp-billsHistoryTitle"]',
      )

      await this.runInWorker('tryClickOnePdf')
      this.log('Get Out with pdfButtons')
      console.log('This is the store', this.store)
      this.store.dataUri = []
      for (let i = 0; i < this.store.resolvedBase64.length; i++) {
        this.store.dataUri.push({
          filename: `test${i}.pdf`,
          dataUri: this.store.resolvedBase64[i],
        })
      }

      const result = await this.saveFiles(this.store.dataUri, {
        context,
        fileIdAttributes: ['filename'],
        contentType: 'application/pdf',
      })
      // this.log(result)
    }

    // Putting a falsy selector allows you to stay on the wanted page for debugging purposes
    await this.waitForElementInWorker(
      '[aria-labelledby="bp-billsHistoryyyTitle"]',
    )

    // await this.findClientRefForAllContracts(contracts, context)
    // const echeancierResult = await this.fetchEcheancierBills(contracts, context)
    // const housing = this.formatHousing(
    //   contracts,
    //   echeancierResult,
    //   await this.fetchHousing(),
    // )
    // await this.saveIdentity({contact, housing})
    // await this.saveBills()
    // }
  }

  findPdfButtons() {
    this.log('Starting findPdfButtons')
    const buttons = Array.from(
      document.querySelectorAll('a[class="icon-pdf-file bp-downloadIcon"]'),
    )
    console.log('buttons in findPdfButtons', buttons)
    return buttons
  }

  findMoreBillsButton() {
    this.log('Starting findMoreBillsButton')
    const buttons = Array.from(
      document.querySelectorAll('[data-e2e="bh-more-bills"]'),
    )
    return buttons
  }

  //////////
  //WORKER//
  //////////
  async checkAuthenticated() {
    // If Orange page is detected
    if (
      document.location.href.includes(
        'https://espace-client.orange.fr/page-accueil',
      ) &&
      document.querySelector('[class="is-mobile is-logged"]')
    ) {
      return true
    }
    // If Sosh page is detected
    if (
      document.location.href.includes(
        'https://espace-client.orange.fr/accueil',
      ) &&
      document.querySelector('[id="oecs__connecte-se-deconnecter"]')
    ) {
      return true
    }
    return false
  }
  async getUserMail() {
    // For Sosh page
    const result = document.querySelector(
      '.oecs__zone-footer-button-mail',
    ).innerHTML
    if (result) {
      return result
    }
    return false
  }

  async findClientRef() {
    let parsedElem
    let clientRef
    if (document.querySelector('a[class="ob1-link-icon ml-1 py-1"]')) {
      this.log('Elements founded')
      parsedElem = document
        .querySelectorAll('a[class="ob1-link-icon ml-1 py-1"]')[1]
        .getAttribute('href')

      this.log(parsedElem)
      const clientRefArray = parsedElem.match(/([0-9]*)/g)
      this.log(clientRefArray.length)

      for (let i = 0; i < clientRefArray.length; i++) {
        this.log('Get in loop')

        const testedIndex = clientRefArray.pop()
        this.log('This is length of testIndex')
        this.log(testedIndex)
        if (testedIndex.length === 0) {
          this.log('No clientRef founded')
          this.log(testedIndex.length)
        } else {
          this.log('clientRef founded')
          clientRef = testedIndex
          break
        }
      }
      this.log('this is clientRef')
      return clientRef
    }
  }

  async tryClickOnePdf() {
    log.debug('Get in tryClickOnePdf')
    const moreBillsButton = this.findMoreBillsButton()
    if (moreBillsButton.length !== 0) {
      console.log('moreBillsButton founded,clicking on it')
      moreBillsButton[0].click()
      console.log('moreBillsButton clicked')
      await sleep(5)
      // if (buttons.length < 13) {
      //   console.log('buttons length is smaller than 13: ', buttons.length)
      //   buttons = this.findPdfButtons()
      // }
    }
    let buttons = this.findPdfButtons()
    if (buttons[0].length === 0) {
      this.log('ERROR Could not find pdf button')
      return 'VENDOR_DOWN'
    } else {
      console.log('buttons length is: ', buttons.length)
      for (const button of buttons) {
        console.log('will click')
        button.click()
        log.debug('button clicked')
        sleep(2)
      }
    }
    console.log('awaiting promises')
    const resolvedPromises = await Promise.all(promises)
      .then(result => {
        console.log('Promises received from promises', result)
      })
      .catch(err => {
        console.log('Failed to get promises', err)
      })
    await sleep(15)
    const resolvedBase64 = await Promise.all(promisesToConvertBlobToBase64)
    console.log('Promises received from promiseToConvert', resolvedBase64)
    log.debug('Sending to pilot')
    await this.sendToPilot({
      resolvedBase64,
    })
    return true
  }

  async fetchBills(clientRef) {
    this.log('Fetching Bills')
  }
}

const connector = new OrangeContentScript()
connector
  .init({
    additionalExposedMethodsNames: [
      'getUserMail',
      'findClientRef',
      'fetchBills',
      'tryClickOnePdf',
    ],
  })
  .catch(err => {
    console.warn(err)
  })

// Used for debug purposes only
function sleep(delay) {
  return new Promise(resolve => {
    setTimeout(resolve, delay * 1000)
  })
}
