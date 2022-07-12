import ContentScript from '../../connectorLibs/ContentScript'
import {kyScraper as ky} from '../../connectorLibs/utils'
import {format} from 'date-fns'
import Minilog from '@cozy/minilog'
import {parseCommands} from './scraping'

const log = Minilog('ContentScript')
Minilog.enable()

const baseUrl = 'https://www.amazon.fr'
const orderUrl = `${baseUrl}/gp/your-account/order-history`
const vendor = 'amazon'

class AmazonContentScript extends ContentScript {

  //P
  async ensureAuthenticated() {
    this.log('Starting ensureAuth')
    await this.bridge.call('setWorkerState', {
      url: baseUrl,
      visible: false,
    })

    await this.waitForElementInWorker('#nav-progressive-greeting')
    const authenticated = await this.runInWorker('checkAuthenticated')
    this.log('Authenticated : '+authenticated)
    if (!authenticated) {
      await this.showLoginFormAndWaitForAuthentication()
      if (this.store && (this.store.email || this.store.password)) {
        this.log(JSON.stringify(this.store))
        await this.saveCredentials(this.store)
      }
    }
    return true
  }

  //W
  async checkAuthenticated() {
    const result = Boolean(document.querySelector('#nav-greeting-name'))
    this.log('Authentification detection : '+result)
    return result
  }

  //W
  findAndSendCredentials(e) {
    const emailField = document.querySelector('#ap_email_login')
    const passwordField = document.querySelector('#ap_password')
    this.log('Executing findAndSendCredentials')
    if (emailField) {
      this.sendToPilot({
        email: emailField.value
      })
    }
    if (passwordField) {
      this.sendToPilot({
        password: passwordField.value
      })
    }
    return true
  }

  //P
  async showLoginFormAndWaitForAuthentication() {
    this.log('showLoginFormAndWaitForAuthentication start')
    await this.bridge.call('setWorkerState', {
      url: baseUrl,
      visible: false,
    })
    await this.waitForElementInWorker('a[id="nav-logobar-greeting"]')
    await this.clickAndWait(
      'a[id="nav-logobar-greeting"]',
      '#ap_email_login'
    )

    await this.bridge.call('setWorkerState', {
      visible: true
    })

    this.log('Waiting on login form')
    await this.runInWorker('setListenerLogin')
    await this.waitForElementInWorker('[name="rememberMe"]')
    await this.runInWorker('checkingBox')

    await this.runInWorker('setListenerPassword')
    await this.runInWorkerUntilTrue({method: 'waitForAuthenticated'})
    await this.bridge.call('setWorkerState', {
      visible: false,
    })
  }

  //W
  async setListenerLogin() {
    const loginField = document.querySelector('#ap_email_login')
    if (loginField) {
      loginField.addEventListener(
        'change',
        this.findAndSendCredentials.bind(this)
      )
    }
  }

  //W
  async setListenerPassword() {
    const passwordField = document.querySelector('#ap_password')
    if (passwordField) {
      passwordField.addEventListener(
        'change',
        this.findAndSendCredentials.bind(this)
      )
    }
  }

  //W
  async checkingBox() {
    const checkbox = document.querySelector('[name="rememberMe"]')
    // Checking the 'Stay connected' checkbox when loaded
    if (checkbox.checked == false) {
      this.log('Checking the RememberMe box')
      checkbox.click()
    }
  }


  //P
  async fetch(context) {
    await this.bridge.call(
      'setUserAgent',
      'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:94.0) Gecko/20100101 Firefox/94.0',
    )

    const bills = await this.fetchPeriod('months-3')
    await this.saveBills(bills, {contentType: 'application/pdf'}, context)

    await this.clickAndWait(
      "a.hmenu-item[href*='order-history']",
      "[name='orderFilter']"
    )

    const years = await this.runInWorker('getYears')
    this.log('Years :' + years)
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

  //W
  async getYears() {
    return Array
      .from(document.querySelectorAll("[name='orderFilter'] option"))
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
        bill.vendor = vendor
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

  //P
  async getUserDataFromWebsite() {

    if (this.store && this.store.email) {
      return {
        sourceAccountIdentifier: this.store.email
      }
    } else {
      let credentials = await this.getCredentials()
      if (credentials && credentials.email) {
        return {
          sourceAccountIdentifier: credentials.email
        }
      } else {
        this.log('No credentials found')
      }
    }
  }
}

const connector = new AmazonContentScript()
connector
  .init({additionalExposedMethodsNames: [
    'getYears',
    'checkingBox',
    'setListenerLogin',
    'setListenerPassword'
  ]
        })
  .catch((err) => {
    console.warn(err)
  })
