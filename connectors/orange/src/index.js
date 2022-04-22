import ContentScript from '../../connectorLibs/ContentScript'
import {kyScraper as ky} from '../../connectorLibs/utils'
import Minilog from '@cozy/minilog'
import get from 'lodash/get'
import {format} from 'date-fns'
import waitFor from 'p-wait-for'

const log = Minilog('ContentScript')
Minilog.enable()

const BASE_URL = 'https://espace-client.orange.fr'
const LOGIN_URL =
  'https://login.orange.fr/?service=nextecare&return_url=https%3A%2F%2Fespace-client.orange.fr%2Fpage-accueil#/password'
const DEFAULT_PAGE_URL = BASE_URL + '/accueil'
const DEFAULT_SOURCE_ACCOUNT_IDENTIFIER = 'orange'

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

  // async fetch(context) {
  //   log.debug('fetch start')
  //   const contact = await this.fetchContact()
  //   const contracts = await this.fetchContracts()
  //   await this.fetchAttestations(contracts, context)
  //   await this.fetchBillsForAllContracts(contracts, context)
  //   const echeancierResult = await this.fetchEcheancierBills(contracts, context)
  //   const housing = this.formatHousing(
  //     contracts,
  //     echeancierResult,
  //     await this.fetchHousing(),
  //   )
  //   await this.saveIdentity({contact, housing})
  // }

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
    const result = document.querySelector(
      '.oecs__zone-footer-button-mail',
    ).innerHTML
    if (result) {
      return result
    }
    return false
  }
}

const connector = new OrangeContentScript()
connector
  .init({
    additionalExposedMethodsNames: [
      'getUserMail',
      //      'checkOtpNeeded',
    ],
  })
  .catch(err => {
    console.warn(err)
  })

// function sleep(delay) {
//   return new Promise(resolve => {
//     setTimeout(resolve, delay * 1000)
//   })
// }
