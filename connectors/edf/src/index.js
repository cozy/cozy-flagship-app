import ContentScript from '../../connectorLibs/ContentScript'
import {kyScraper as ky} from '../../connectorLibs/utils'
import Minilog from '@cozy/minilog'
import get from 'lodash/get'
import {format} from 'date-fns'
import waitFor from 'p-wait-for'

const log = Minilog('ContentScript')
Minilog.enable()

class EdfContentScript extends ContentScript {
  /////////
  //PILOT//
  /////////
  async ensureAuthenticated() {
    await this.goto(
      'https://particulier.edf.fr/fr/accueil/espace-client/tableau-de-bord.html',
    )
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
    log.debug('autologin start')
    await this.goto(
      'https://particulier.edf.fr/fr/accueil/espace-client/tableau-de-bord.html',
    )
    await Promise.all([
      this.autoLogin(credentials),
      this.runInWorkerUntilTrue({method: 'waitForAuthenticated'}),
    ])
  }

  async autoLogin(credentials) {
    log.debug('fill email field')
    await this.waitForElementInWorker('#email')
    await this.runInWorker('fillText', '#email', credentials.email)
    await this.runInWorker('click', '#username-next-button > span')

    log.debug('wait for password field or otp')
    await Promise.race([
      this.waitForElementInWorker('#password2-password-field'),
      this.waitForElementInWorker('.auth #title-hotp3'),
    ])

    if (await this.runInWorker('checkOtpNeeded')) {
      log.warn('Found otp needed')
      throw new Error('OTP_NEEDED')
    }
    log.debug('No otp needed')

    log.debug('fill password field')
    await this.runInWorker(
      'fillText',
      '#password2-password-field',
      credentials.password,
    )
    await this.runInWorker('click', '#password2-next-button > span')
  }

  async waitForUserAuthentication() {
    log.debug('waitForUserAuthentication start')
    await this.setWorkerState({visible: true})
    await this.goto(
      'https://particulier.edf.fr/fr/accueil/espace-client/tableau-de-bord.html',
    )
    await this.runInWorkerUntilTrue({method: 'waitForAuthenticated'})
    if (this.store && this.store.email && this.store.password) {
      await this.saveCredentials(this.store)
    }
    await this.setWorkerState({visible: false})
  }

  async fetch(context) {
    log.debug('fetch start')
    const identity = await this.fetchIdentity()
    await this.saveIdentity(identity)
    const contracts = await this.fetchContracts()
    await this.fetchAttestations(contracts, context)
    await this.fetchBillsForAllContracts(contracts, context)
    await this.fetchEcheancierBills(contracts, context)
  }

  async fetchEcheancierBills(contracts, context) {
    this.log('fetching echeancier bills')

    // files won't download if this page is not fully loaded before
    await this.clickAndWait(
      "a.accessPage[href*='factures-et-paiements.html']",
      '.timeline-header__download',
    )

    const result = await ky
      .get(
        `https://particulier.edf.fr/services/rest/bill/consult?_=${Date.now()}`,
      )
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

    if (
      result.monthlyPaymentAllowedStatus === 'MENS' &&
      result.paymentSchedule &&
      get(result, 'paymentSchedule.deadlines')
    ) {
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
        .get(
          'https://particulier.edf.fr/services/rest/edoc/getPaymentsDocuments',
        )
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
        'https://particulier.edf.fr/services/rest/document/getDocumentGetXByData?' +
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
  }

  async fetchBillsForAllContracts(contracts, context) {
    this.log('fetchBillsForAllContracts')
    // files won't download if this page is not fully loaded before
    await this.clickAndWait('#facture', '#factureSelection')
    const billDocResp = await ky
      .get('https://particulier.edf.fr/services/rest/edoc/getBillsDocuments')
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
            'https://particulier.edf.fr/services/rest/document/getDocumentGetXByData?' +
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
      .get(
        `https://particulier.edf.fr/services/rest/init/initPage?_=${Date.now()}`,
      )
      .json()
    return dataCsrfToken.data
  }

  async fetchAttestations(contracts, context) {
    await this.goto(
      'https://particulier.edf.fr/fr/accueil/espace-client/tableau-de-bord.html',
    )

    await this.waitForElementInWorker(
      "a.accessPage[href*='mes-documents.html']",
    )
    await this.clickAndWait(
      "a.accessPage[href*='mes-documents.html']",
      '.contract-icon',
    )
    const attestationData = await ky
      .get(
        `https://particulier.edf.fr/services/rest/edoc/getAttestationsContract?_=${Date.now()}`,
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
                'https://particulier.edf.fr/services/rest/document/getAttestationContratPDFByData?' +
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
      .get(
        'https://particulier.edf.fr/services/rest/authenticate/getListContracts',
      )
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

  async fetchIdentity() {
    this.log('fetching identity')
    const json = await ky
      .get(
        'https://particulier.edf.fr/services/rest/context/getCustomerContext',
      )
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
      .get(
        'https://particulier.edf.fr/services/rest/context/getCustomerContext',
      )
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
}

const connector = new EdfContentScript()
connector
  .init({additionalExposedMethodsNames: ['waitForLoginForm', 'checkOtpNeeded']})
  .catch(err => {
    console.warn(err)
  })
