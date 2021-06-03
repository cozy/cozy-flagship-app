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
    const {redirected} = await ky.get('https://m.blablacar.fr/dashboard')
    return !redirected
  }

  async showLoginFormAndWaitForAuthentication() {
    log.debug('showLoginFormAndWaitForAuthentication start')
    await this.bridge.call('setWorkerState', {
      url: baseUrl,
      visible: true,
    })
    await this.runInWorkerUntilTrue('waitForAuthenticated')
    await this.bridge.call('setWorkerState', {
      visible: false,
    })
  }

  async fetch(context) {
    log.debug(context, 'fetch context')
    log.debug('identity')
    const {session} = window.INIT_STORE
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

    // await this.saveIdentity(identity) FIXME permission problem

    await this.bridge.call('setWorkerState', {
      url: 'https://m.blablacar.fr/dashboard/account/payments-done',
      visible: false,
    })

    // FIXME waitForElement
    await sleep(5000)
    let result = await this.bridge.call('runInWorker', 'getPayments')
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
  }

  async getPayments() {
    const result = Array.from(
      document.querySelectorAll('.my-payments .card'),
    ).map((doc) => ({
      html: doc.innerHTML,
      from: doc.querySelector('h4.fromto').innerText.trim(),
      to: doc.querySelector('h4 .to').innerText.trim(),
      amount: doc.querySelector('strong').innerText,
      date: doc.querySelector('.span4 p.margin-half-bottom').innerText,
    }))
    console.log(result)
    return result
  }

  async parseDocuments(resp) {
    const $ = await resp.$()
    console.log($.html())
    const cards = Array.from($('.my-payments .card')).map((d) => d.html())
    console.log(cards)
    // const result = await resp.scrape(
    //   {
    //     filecontent: {
    //       s
    //     }
    //     amount: {
    //       sel: '.price_color',
    //       parse: normalizePrice,
    //     },
    //     filename: {
    //       sel: 'h3 a',
    //       attr: 'title',
    //     },
    //     fileurl: {
    //       sel: 'img',
    //       attr: 'src',
    //       parse: (src) => `${baseUrl}/${src}`,
    //     },
    //   },
    //   '.my-payments .card',
    // )
    // return result.map((doc) => ({
    //   ...doc,
    //   // The saveBills function needs a date field
    //   // even if it is a little artificial here (these are not real bills)
    //   date: new Date(),
    //   currency: 'EUR',
    //   filename: `${format(
    //     new Date(),
    //     'yyyy-MM-dd',
    //   )}_template_${doc.amount.toFixed(2)}EUR${
    //     doc.vendorRef ? '_' + doc.vendorRef : ''
    //   }.jpg`,
    //   vendor: 'template',
    // }))
    // }
  }

  async getUserDataFromWebsite() {
    log.debug('getUserDataFromWebsite')
    return {
      sourceAccountIdentifier: window.INIT_STORE.session.email,
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
