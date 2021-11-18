import ContentScript from '../../connectorLibs/ContentScript'
import {kyScraper as ky} from '../../connectorLibs/utils'
import Minilog from '@cozy/minilog'
import get from 'lodash/get'

const log = Minilog('ContentScript')
Minilog.enable()

const baseUrl = 'https://m.blablacar.fr/login/email'

class BlablacarContentScript extends ContentScript {
  async ensureAuthenticated() {
    if (!(await this.checkAuthenticated())) {
      this.log('not authenticated')
      await this.showLoginFormAndWaitForAuthentication()
    }
  }

  async checkAuthenticated() {
    log.debug('checkAuthenticated start')
    const {redirected} = await ky.get(
      'https://m.blablacar.fr/dashboard/profile/menu',
    )
    return !redirected
  }

  async showLoginFormAndWaitForAuthentication() {
    log.debug('showLoginFormAndWaitForAuthentication start')
    await this.bridge.call('setWorkerState', {
      url: baseUrl,
      visible: true,
    })
    await this.runInWorkerUntilTrue({method: 'waitForAuthenticated'})
    await this.bridge.call('setWorkerState', {
      visible: false,
    })
  }

  async fetch(context) {
    log.debug(context, 'fetch context')
    log.debug('identity')
    const {session} = window.INFRASTRUCTURE_DEPRECATED_REDUX_STORE
    const identity = {
      fullname: `${session.firstName} ${session.lastName}`,
      name: {
        familyName: session.lastName,
        givenName: session.firstName,
      },
      email: [
        {
          address: session.email,
        },
      ],
      phone: [
        {
          number: get(session, 'phone.raw_input'),
        },
      ],
    }

    await this.saveIdentity(identity)

    await this.bridge.call('setWorkerState', {
      url: 'https://m.blablacar.fr/dashboard/account/payments-history',
      visible: false,
    })

    await this.waitForElementInWorker('.section-content > .kirk-item')
    let result = await this.runInWorker('getPayments')
    if (result && result.length) {
      await this.saveFiles(
        result.map((entry) => ({
          filestream: entry.html,
          filename: `${entry.from} - ${entry.to}_${entry.date}_${entry.amount}.html`,
        })),
        {
          contentType: 'application/html',
          fileIdAttributes: ['filename'],
          context,
        },
      )
    } else {
      log('No file to save', result)
    }
  }

  async getPayments() {
    const result = Array.from(
      document.querySelectorAll('.section-content > .kirk-item'),
    )
      .map((doc) => {
        const [from, to] =
          doc.querySelectorAll('.kirk-item-body > span > span') || []
        const amount = doc.querySelector('.kirk-item-rightText')
        const date = doc.querySelector('.kirk-text-title')
        return {
          html: doc.innerHTML,
          from: from ? from.innerText.trim() : null,
          to: to ? to.innerText.trim() : null,
          amount: amount ? amount.innerText : null,
          date: date ? date.innerText : null,
        }
      })
      .filter((doc) => {
        const isCorrectBill = doc.from && doc.to && doc.amount && doc.date
        if (!isCorrectBill) {
          log.warn(doc, 'is not a correct bill')
        }
        return isCorrectBill
      })
    return result
  }

  async getUserDataFromWebsite() {
    log.debug('getUserDataFromWebsite')
    return {
      // deprecated redux store but the token which allow to access the same data via a json api is
      // also in the same deprecated redux store at the moment
      sourceAccountIdentifier:
        window.INFRASTRUCTURE_DEPRECATED_REDUX_STORE.session.email,
    }
  }
}

const connector = new BlablacarContentScript()
connector
  .init({
    additionalExposedMethodsNames: ['getPayments'],
  })
  .catch((err) => {
    console.warn(err)
  })
