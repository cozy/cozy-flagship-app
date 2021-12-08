import ContentScript from '../../connectorLibs/ContentScript'
import {kyScraper as ky} from '../../connectorLibs/utils'
import {format} from 'date-fns'
import Minilog from '@cozy/minilog'
import {parseCommands} from './scraping'

const log = Minilog('ContentScript')
Minilog.enable()

const baseUrl = 'https://www.amazon.fr'
const orderUrl = `${baseUrl}/gp/your-account/order-history`

class AmazonContentScript extends ContentScript {
  async ensureAuthenticated() {
    await this.bridge.call('setWorkerState', {
      url: baseUrl,
      visible: false,
    })
    await this.waitForElementInWorker('#nav-progressive-greeting')
    const authenticated = await this.runInWorker('checkAuthenticated')
    if (!authenticated) {
      await this.showLoginFormAndWaitForAuthentication()
    }
    return true
  }

  async checkAuthenticated() {
    const result = Boolean(document.querySelector('#nav-greeting-name'))
    return result
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
    await this.bridge.call(
      'setUserAgent',
      'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:94.0) Gecko/20100101 Firefox/94.0',
    )

    const bills = await this.fetchPeriod('months-3')
    await this.saveBills(bills, {contentType: 'application/pdf'}, context)

    await this.clickAndWait(
      "a.hmenu-item[href*='order-history']",
      '#orderFilter',
    )

    const years = await this.runInWorker('getYears')
    for (const year of years) {
      this.log('Saving year ' + year)
      const periodBills = await this.fetchPeriod(year)
      await this.saveBills(
        periodBills,
        {contentType: 'application/pdf'},
        context,
      )
    }
  }

  async getYears() {
    return Array.from(document.querySelectorAll('#orderFilter option'))
      .map((el) => el.value)
      .filter((period) => period.includes('year'))
  }

  async fetchPeriod(period) {
    this.log('Fetching the list of orders for period ' + period)
    const resp = await ky.get(
      orderUrl + `?orderFilter=${period}&disableCsd=missing-library`,
    )
    let commands = await parseCommands(resp)

    commands = commands.filter(
      (command) =>
        command.vendorRef &&
        command.detailsUrl &&
        command.commandDate &&
        command.amount,
    )

    for (const bill of commands) {
      const detailsResp = await ky.get(baseUrl + bill.detailsUrl)
      const details$ = await detailsResp.$()
      const normalInvoice = details$("a[href*='invoice.pdf']")
      if (normalInvoice.length) {
        bill.fileurl = baseUrl + normalInvoice.attr('href')
        bill.filename = `${format(
          bill.commandDate,
          'yyyy-MM-dd',
        )}_amazon_${bill.amount.toFixed(2)}${bill.currency}_${
          bill.vendorRef
        }.pdf`
      } else {
        log.warn(
          `Could not find a file for bill ${bill.vendorRef} from ${bill.commandDate}`,
        )
      }
    }

    return commands
  }

  async getUserName() {
    return window.$Nav.manager.get('config').firstName
  }

  async getUserDataFromWebsite() {
    // we get the name displayed as "Bonjour <username>" in the default amazon page
    // to get more detailed profile information, we need to go to "votre comte" > "Connexion et
    // sécurité" which is begin a new authentication by the user
    // I don't think it is wise to force the user to log twice
    const userName = await this.runInWorker('getUserName')
    return {
      sourceAccountIdentifier: userName,
    }
  }
}

const connector = new AmazonContentScript()
connector
  .init({additionalExposedMethodsNames: ['getUserName', 'getYears']})
  .catch((err) => {
    console.warn(err)
  })
