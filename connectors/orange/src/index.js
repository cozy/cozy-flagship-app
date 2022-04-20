import ContentScript from '../../connectorLibs/ContentScript'
import {kyScraper as ky} from '../../connectorLibs/utils'
import Minilog from '@cozy/minilog'
import get from 'lodash/get'
import {format} from 'date-fns'
import waitFor from 'p-wait-for'

const log = Minilog('ContentScript')
Minilog.enable()

const BASE_URL = 'https://espace-client.orange.fr'
const LOGIN_URL = 'https://login.orange.fr/?return_url=https%3A%2F%2Fwww.orange.fr%2Fportail#/password'
const DEFAULT_PAGE_URL =  BASE_URL + '/accueil'


class OrangeContentScript extends ContentScript {
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



  async fetch(context) {
    log.debug('fetch start')
    const contact = await this.fetchContact()
    const contracts = await this.fetchContracts()
    await this.fetchAttestations(contracts, context)
    await this.fetchBillsForAllContracts(contracts, context)
    const echeancierResult = await this.fetchEcheancierBills(contracts, context)
    const housing = this.formatHousing(
      contracts,
      echeancierResult,
      await this.fetchHousing(),
    )
    await this.saveIdentity({contact, housing})
  }


  //////////
  //WORKER//
  //////////
  async checkAuthenticated() {
    const result =
      document.location.href.includes('https://espace-client.orange.fr/')
//      document.location.href !== FIRST_LOAD_URL

    return result
  }

}

const connector = new OrangeContentScript()
connector
  .init({
    additionalExposedMethodsNames: [
//      'waitForLoginForm',
//      'checkOtpNeeded',
    ],
  })
  .catch(err => {
    console.warn(err)
  })
