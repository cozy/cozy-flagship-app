import ContentScript from '../../connectorLibs/ContentScript'
import {kyScraper as ky} from '../../connectorLibs/utils'
import Minilog from '@cozy/minilog'
import get from 'lodash/get'
import {format} from 'date-fns'
import waitFor from 'p-wait-for'
import {formatHousing} from './utils'

const log = Minilog('ContentScript')
Minilog.enable()

const BASE_URL = 'https://particulier.edf.fr'
const DEFAULT_PAGE_URL =
  BASE_URL + '/fr/accueil/espace-client/tableau-de-bord.html'

class EdfContentScript extends ContentScript {
  /////////
  //PILOT//
  /////////
  async ensureAuthenticated() {
    await this.goto(DEFAULT_PAGE_URL)
    log.debug('waiting for any authentication confirmation or login form...')
    await Promise.race([
      this.runInWorkerUntilTrue({method: 'waitForAuthenticated'}),
      this.runInWorkerUntilTrue({method: 'waitForLoginForm'}),
    ])
    if (await this.runInWorker('checkAuthenticated')) {
      this.log('Authenticated')
      return true
    }
    log.debug('Not authenticated')

    let credentials = await this.getCredentials()
    if (credentials && credentials.email && credentials.password) {
      try {
        log.debug('Got credentials, trying autologin')
        await this.tryAutoLogin(credentials)
      } catch (err) {
        log.warn('autoLogin error' + err.message)
        await this.waitForUserAuthentication()
      }
    } else {
      log.debug('No credentials saved, waiting for user input')
      await this.waitForUserAuthentication()
    }
    return true
  }

  async tryAutoLogin(credentials) {
    this.log('autologin start')
    await this.goto(DEFAULT_PAGE_URL)
    await Promise.all([
      this.autoLogin(credentials),
      this.runInWorkerUntilTrue({method: 'waitForAuthenticated'}),
    ])
  }

  async autoLogin(credentials) {
    this.log('fill email field')
    const emailInputSelector = '#email'
    const passwordInputSelector = '#password2-password-field'
    const emailNextButtonSelector = '#username-next-button > span'
    const passwordNextButtonSelector = '#password2-next-button > span'
    const otpNeededSelector = '.auth #title-hotp3'
    await this.waitForElementInWorker(emailInputSelector)
    await this.runInWorker('fillText', emailInputSelector, credentials.email)
    await this.runInWorker('click', emailNextButtonSelector)

    this.log('wait for password field or otp')
    await Promise.race([
      this.waitForElementInWorker(passwordInputSelector),
      this.waitForElementInWorker(otpNeededSelector),
    ])

    if (await this.runInWorker('checkOtpNeeded')) {
      log.warn('Found otp needed')
      throw new Error('OTP_NEEDED')
    }
    log.debug('No otp needed')

    log.debug('fill password field')
    await this.runInWorker(
      'fillText',
      passwordInputSelector,
      credentials.password,
    )
    await this.runInWorker('click', passwordNextButtonSelector)
  }

  async waitForUserAuthentication() {
    log.debug('waitForUserAuthentication start')
    await this.setWorkerState({visible: true, url: DEFAULT_PAGE_URL})
    await this.runInWorkerUntilTrue({method: 'waitForAuthenticated'})
    if (this.store && this.store.email && this.store.password) {
      await this.saveCredentials(this.store)
    }
    await this.setWorkerState({visible: false})
  }

  async fetch(context) {
    log.debug('fetch start')
    const contact = await this.fetchContact()
    const contracts = await this.fetchContracts()
    await this.fetchAttestations(contracts, context)
    await this.fetchBillsForAllContracts(contracts, context)
    const echeancierResult = await this.fetchEcheancierBills(contracts, context)
    const housing = formatHousing(
      contracts,
      echeancierResult,
      await this.fetchHousing(),
    )
    await this.saveIdentity({contact, housing})
  }

  async fetchHousing() {
    const consoLinkSelector = "[data-label='ma_conso']"
    const continueLinkSelector = "a[href='https://equilibre.edf.fr/comprendre']"
    const notConnectedSelector = 'div.session-expired-message button'
    await this.clickAndWait(consoLinkSelector, continueLinkSelector)
    await this.runInWorker('click', continueLinkSelector)
    await Promise.race([
      this.waitForElementInWorker(notConnectedSelector),
      this.waitForElementInWorker('.header-logo'),
    ])

    const isConnected = await this.runInWorker('checkConnected')
    if (!isConnected) {
      await this.runInWorker('click', notConnectedSelector)
    }
    this.runInWorker('waitForSessionStorage')

    const {
      constructionDate = {},
      equipment = {},
      heatingSystem = {},
      housingType = {},
      lifeStyle = {},
      surfaceInSqMeter = {},
      residenceType = {},
    } = await this.runInWorker('getHomeProfile')

    const contractElec = await this.runInWorker('getContractElec')

    const rawConsumptions = await this.runInWorker('getConsumptions')

    return {
      constructionDate,
      equipment,
      heatingSystem,
      housingType,
      lifeStyle,
      surfaceInSqMeter,
      residenceType,
      contractElec,
      rawConsumptions,
    }
  }

  async fetchEcheancierBills(contracts, context) {
    this.log('fetching echeancier bills')

    // files won't download if this page is not fully loaded before
    const fullpageLoadedSelector = '.timeline-header__download'
    const billLinkSelector = "a.accessPage[href*='factures-et-paiements.html']"
    await this.clickAndWait(billLinkSelector, fullpageLoadedSelector)

    const result = await ky
      .get(`${BASE_URL}/services/rest/bill/consult?_=${Date.now()}`)
      .json()

    if (!result || !result.feSouscriptionResponse) {
      log.warn('fetchEcheancierBills: could not find contract')
      return
    }

    const contractNumber = parseFloat(
      get(result, 'feSouscriptionResponse.tradeNumber'),
    )
    const subPath = contracts.folders[contractNumber]
    if (!subPath) {
      log.warn(
        `fetchEcheancierBills: could not create subPath for ${contractNumber}`,
      )
      return
    }

    const isMonthly =
      result.monthlyPaymentAllowedStatus === 'MENS' &&
      result.paymentSchedule &&
      get(result, 'paymentSchedule.deadlines')

    if (isMonthly) {
      const startDate = new Date(get(result, 'paymentSchedule.startDate'))
      const bills = result.paymentSchedule.deadlines
        .filter(bill => bill.payment === 'EFFECTUE')
        .map(bill => ({
          vendor: 'EDF',
          contractNumber,
          startDate,
          date: new Date(bill.encashmentDate),
          amount: bill.electricityAmount + bill.gazAmount,
          currency: '€',
        }))

      const paymentDocuments = await ky
        .get(BASE_URL + '/services/rest/edoc/getPaymentsDocuments')
        .json()

      if (
        paymentDocuments.length === 0 ||
        paymentDocuments[0].listOfPaymentsByAccDTO.length === 0 ||
        !paymentDocuments[0].listOfPaymentsByAccDTO[0].lastPaymentDocument ||
        !paymentDocuments[0].bpDto
      ) {
        log.warn('could not find payment document')
        return
      }

      const csrfToken = await this.getCsrfToken()
      const fileurl =
        BASE_URL +
        '/services/rest/document/getDocumentGetXByData?' +
        new URLSearchParams({
          csrfToken,
          dn: 'CalendrierPaiement',
          pn: paymentDocuments[0].listOfPaymentsByAccDTO[0].lastPaymentDocument
            .parNumber,
          di: paymentDocuments[0].listOfPaymentsByAccDTO[0].lastPaymentDocument
            .documentNumber,
          bn: paymentDocuments[0].bpDto.bpNumberCrypt,
          an: paymentDocuments[0].listOfPaymentsByAccDTO[0].accDTO.numAccCrypt,
        })
      const filename = `${format(
        new Date(
          get(
            paymentDocuments[0],
            'listOfPaymentsByAccDTO[0].lastPaymentDocument.creationDate',
          ),
        ),
        'yyyy',
      )}_EDF_echancier.pdf`

      await this.saveBills(
        bills.map(bill => ({
          ...bill,
          filename,
          fileurl,
          recurrence: 'monthly',
          fileAttributes: {
            metadata: {
              invoiceNumber: bill.vendorRef,
              contentAuthor: 'edf',
              datetime: bill.date,
              datetimeLabel: 'startDate',
              isSubscription: true,
              startDate: bill.date,
              carbonCopy: true,
            },
          },
        })),
        {
          context,
          subPath,
          fileIdAttributes: ['vendorRef', 'startDate'],
          contentType: 'application/pdf',
          qualificationLabel: 'energy_invoice',
        },
      )
    }

    return {isMonthly}
  }

  async fetchBillsForAllContracts(contracts, context) {
    this.log('fetchBillsForAllContracts')
    // files won't download if this page is not fully loaded before
    const billButtonSelector = '#facture'
    const billListSelector = '#factureSelection'
    await this.clickAndWait(billButtonSelector, billListSelector)
    const billDocResp = await ky
      .get(BASE_URL + '/services/rest/edoc/getBillsDocuments')
      .json()

    if (billDocResp.length === 0) {
      log.warn('fetchBillsForAllContracts: could not find bills')
      return
    }

    for (const bp of billDocResp) {
      if (!bp.bpDto) {
        log.warn('fetchBillsForAllContracts: could not find bills')
        continue
      }

      const client = bp.bpDto
      if (!client) {
        log.warn('fetchBillsForAllContracts: Could not find bills')
        return
      }
      const accList = bp.listOfBillsByAccDTO
      for (let acc of accList) {
        const contract = acc.accDTO
        const subPath = contracts.folders[contract.numAcc]
        for (let bill of acc.listOfbills) {
          const cozyBill = {
            vendor: 'EDF',
            vendorRef: bill.documentNumber,
            contractNumber: contract.numAcc,
            amount: parseFloat(bill.billAmount),
            currency: '€',
            date: new Date(bill.creationDate),
          }

          if (cozyBill.amount < 0) {
            cozyBill.amount = Math.abs(cozyBill.amount)
            cozyBill.isRefund = true
          }

          cozyBill.filename = `${format(
            cozyBill.date,
            'yyyy-MM-dd',
          )}_EDF_${cozyBill.amount.toFixed(2)}€.pdf`
          const csrfToken = await this.getCsrfToken()
          cozyBill.fileurl =
            BASE_URL +
            '/services/rest/document/getDocumentGetXByData?' +
            new URLSearchParams({
              csrfToken,
              dn: 'FACTURE',
              pn: bill.parNumber,
              di: bill.documentNumber,
              bn: client.bpNumberCrypt,
              an: contract.numAccCrypt,
            })

          cozyBill.fileAttributes = {
            metadata: {
              invoiceNumber: bill.vendorRef,
              contentAuthor: 'edf',
              datetime: new Date(bill.creationDate),
              datetimeLabel: 'issueDate',
              isSubscription: true,
              issueDate: new Date(bill.creationDate),
              carbonCopy: true,
            },
          }
          await this.saveBills([cozyBill], {
            context,
            subPath,
            fileIdAttributes: ['vendorRef'],
            contentType: 'application/pdf',
            qualificationLabel: 'energy_invoice',
          })
        }
      }
    }
  }

  async getCsrfToken() {
    const dataCsrfToken = await ky
      .get(BASE_URL + `/services/rest/init/initPage?_=${Date.now()}`)
      .json()
    return dataCsrfToken.data
  }

  async fetchAttestations(contracts, context) {
    await this.goto(DEFAULT_PAGE_URL)

    const myDocumentsLinkSelector = "a.accessPage[href*='mes-documents.html']"
    const contractDisplayedSelector = '.contract-icon'
    await this.waitForElementInWorker(myDocumentsLinkSelector)
    await this.clickAndWait(myDocumentsLinkSelector, contractDisplayedSelector)
    const attestationData = await ky
      .get(
        BASE_URL +
          `/services/rest/edoc/getAttestationsContract?_=${Date.now()}`,
      )
      .json()

    if (attestationData.length === 0) {
      this.log('Could not find any attestation')
      return
    }

    for (const bp of attestationData) {
      if (!bp.listOfAttestationsContractByAccDTO) {
        this.log('Could not find an attestation')
        continue
      }

      for (const contract of bp.listOfAttestationsContractByAccDTO) {
        if (
          !contract.listOfAttestationContract ||
          contract.listOfAttestationContract.length === 0
        ) {
          this.log('Could not find an attestation for')
          this.log(bp)
          continue
        }
        const csrfToken = await this.getCsrfToken()

        const subPath = contracts.folders[contract.accDTO.numAcc]

        await this.saveFiles(
          [
            {
              shouldReplaceFile: () => true,
              filename: 'attestation de contrat edf.pdf',
              vendorRef:
                contracts.details[contract.accDTO.numAcc].contracts[0]
                  .pdlnumber,
              fileurl:
                BASE_URL +
                '/services/rest/document/getAttestationContratPDFByData?' +
                new URLSearchParams({
                  csrfToken,
                  aN: contract.accDTO.numAccCrypt + '==',
                  bp:
                    contract.listOfAttestationContract[0].bpNumberCrypt + '==',
                  cl: contract.listOfAttestationContract[0].firstLastNameCrypt,
                  ct:
                    contract.listOfAttestationContract[0]
                      .attestationContractNumberCrypt + '==',
                  ot: 'Tarif Bleu',
                  _: Date.now(),
                }),
            },
          ],
          {
            context,
            subPath,
            fileIdAttributes: ['vendorRef'],
            contentType: 'application/pdf',
          },
        )
      }
    }
  }

  async fetchContracts() {
    this.log('fetching contracts')
    const contracts = await ky
      .get(BASE_URL + '/services/rest/authenticate/getListContracts')
      .json()

    const result = {folders: {}, details: {}}

    for (const contractDetails of contracts.customerAccordContracts) {
      const contractNumber = Number(contractDetails.number)
      result.folders[
        contractNumber
      ] = `${contractNumber} ${contractDetails.adress.city}`
      result.details[contractNumber] = contractDetails
    }
    return result
  }

  async fetchContact() {
    this.log('fetching identity')
    const json = await ky
      .get(BASE_URL + '/services/rest/context/getCustomerContext')
      .json()

    let ident = {}
    if (!json.bp) {
      throw new Error('Not enough data to make identiy, only request failed')
    }
    if (json.bp.lastName && json.bp.firstName) {
      ident.name = {
        givenName: json.bp.firstName,
        familyName: json.bp.lastName,
      }
    }
    if (
      json.bp.streetNumber &&
      json.bp.streetName &&
      json.bp.postCode &&
      json.bp.city
    ) {
      ident.address = [
        {
          street: `${json.bp.streetNumber} ${json.bp.streetName}`,
          postcode: json.bp.postCode,
          city: json.bp.city,
          formattedAddress:
            `${json.bp.streetNumber} ${json.bp.streetName}` +
            ` ${json.bp.postCode} ${json.bp.city}`,
        },
      ]
    }
    if (json.bp.mail) {
      ident.email = [{address: json.bp.mail}]
    }
    if (json.bp.mobilePhoneNumber) {
      if (ident.phone) {
        ident.phone.push({number: json.bp.mobilePhoneNumber, type: 'mobile'})
      } else {
        ident.phone = [{number: json.bp.mobilePhoneNumber, type: 'mobile'}]
      }
    }
    if (json.bp.fixePhoneNumber) {
      if (ident.phone) {
        ident.phone.push({number: json.bp.fixePhoneNumber, type: 'home'})
      } else {
        ident.phone = [{number: json.bp.fixePhoneNumber, type: 'home'}]
      }
    }

    return ident
  }

  async getUserDataFromWebsite() {
    const context = await ky
      .get(BASE_URL + '/services/rest/context/getCustomerContext')
      .json()
    const mail = get(context, 'bp.mail')
    if (mail) {
      return {
        sourceAccountIdentifier: mail,
      }
    } else {
      throw new Error('No user data identifier. The connector should be fixed')
    }
  }

  //////////
  //WORKER//
  //////////
  async checkAuthenticated() {
    // try to subscribe a listener in the password field if present and not already done
    const passwordField = document.querySelector('#password2-password-field')
    const subscribed = window.__passwordField_subscribed
    if (passwordField && !subscribed) {
      passwordField.addEventListener(
        'change',
        this.findAndSendCredentials.bind(this),
      )
      window.__passwordField_subscribed = true
    }

    return Boolean(document.querySelector('.isAuthentified.show'))
  }
  async checkLoginForm() {
    return Boolean(document.querySelector('.auth #email'))
  }
  async checkOtpNeeded() {
    return Boolean(document.querySelector('.auth #title-hotp3'))
  }

  async waitForLoginForm() {
    await waitFor(this.checkLoginForm, {
      interval: 1000,
      timeout: 30 * 1000,
    })
    return true
  }

  findAndSendCredentials(e) {
    const emailField = document.querySelector('#emailHid')
    const passwordField = document.querySelector('#password2-password-field')
    if (emailField && passwordField) {
      this.sendToPilot({
        email: emailField.value,
        password: passwordField.value,
      })
    }
    return true
  }

  checkConnected() {
    const notConnectedSelector = 'div.session-expired-message button'
    return !document.querySelector(notConnectedSelector)
  }

  async waitForHomeProfile() {
    return await waitFor(
      () => Boolean(window.sessionStorage.getItem('datacache:profil')),
      {
        interval: 1000,
        timeout: 30 * 1000,
      },
    )
  }

  async waitForSessionStorage() {
    await waitFor(
      () => {
        const result = Boolean(
          window.sessionStorage.getItem('datacache:profil'),
        )
        return result
      },
      {
        interval: 1000,
        timeout: 30 * 1000,
      },
    )
  }

  getHomeProfile() {
    const homeStorage = window.sessionStorage.getItem('datacache:profil')
    if (homeStorage) {
      return JSON.parse(homeStorage).value.data.housing
    }
    return {}
  }

  getContractElec() {
    const contractStorage = window.sessionStorage.getItem(
      'datacache:contract-elec',
    )
    if (contractStorage) {
      return JSON.parse(contractStorage).value.data
    }
    return {}
  }

  getConsumptions() {
    const result = {}
    const elecConsumptionKey = Object.keys(window.sessionStorage).find(k =>
      k.includes('datacache:monthly-elec-consumptions'),
    )
    if (elecConsumptionKey) {
      result.elec = JSON.parse(
        window.sessionStorage.getItem(elecConsumptionKey),
      ).value.data
    }

    const gasConsumptionKey = Object.keys(window.sessionStorage).find(k =>
      k.includes('datacache:monthly-gas-consumptions'),
    )
    if (gasConsumptionKey) {
      result.gas = JSON.parse(
        window.sessionStorage.getItem(gasConsumptionKey),
      ).value.data
    }
    return result
  }
}

const connector = new EdfContentScript()
connector
  .init({
    additionalExposedMethodsNames: [
      'waitForLoginForm',
      'checkOtpNeeded',
      'checkConnected',
      'waitForHomeProfile',
      'getHomeProfile',
      'getContractElec',
      'getConsumptions',
      'waitForSessionStorage',
    ],
  })
  .catch(err => {
    console.warn(err)
  })
