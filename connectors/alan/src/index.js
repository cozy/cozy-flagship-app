import ContentScript from '../../connectorLibs/ContentScript'
import {kyScraper as ky, blobToBase64} from '../../connectorLibs/utils'
import Minilog from '@cozy/minilog'
const log = Minilog('ContentScript')
const moment = require('moment')
import groupBy from 'lodash/groupBy'
Minilog.enable('alanCCC')

const BASE_URL = 'https://alan.com/'
const LOGIN_URL = 'https://alan.com/login'
const HOMEPAGE_URL = 'https://alan.com/app/dashboard'
const PERSONAL_INFOS_URL = 'https://alan.com/app/dashboard#individualProfile/home'

class TemplateContentScript extends ContentScript {
  //////////
  //PILOT //
  //////////
  async ensureAuthenticated() {
    const credentials = await this.getCredentials()
    if (credentials) {
      const auth = await this.authWithCredentials()
      if(auth) {
        return true
      }
      return false
    }
    if(!credentials){
      const auth = await this.authWithoutCredentials()
      if(auth) {
        return true
      }
      return false
    }
  }

  async waitForUserAuthentication() {
    this.log('waitForUserAuthentication starts')
    await this.setWorkerState({visible: true})
    await this.runInWorkerUntilTrue({method: 'waitForAuthenticated'})
    await this.setWorkerState({visible: false})
  }


  async getUserDataFromWebsite() {
    await this.runInWorker('getUserIdentity')
    const sourceAccountId = this.store.userIdentity.email ? this.store.userIdentity.email : 'UNKNOWN_ERROR'
    if (sourceAccountId === 'UNKNOWN_ERROR') {
      this.log("Couldn't get a sourceAccountIdentifier, using default")
      return { sourceAccountIdentifier: DEFAULT_SOURCE_ACCOUNT_IDENTIFIER }
    }
    return {
      sourceAccountIdentifier: sourceAccountId
    }
  }
  
  async fetch(context) {
    this.log("fetch starts")
    await this.runInWorker('getDocuments', this.store.jsonDocuments)
    // await this.waitForElementInWorker('[pause]')
    await this.saveFiles(this.store.tpCard, {
      context,
      contentType: 'application/pdf',
      fileIdAttributes: ['filename'],
      qualificationLabel: 'health_insurance_card'
    })
    await this.saveBills(this.store.bills, {
      context,
      keys: ['vendorRef', 'beneficiary', 'date'],
      fileIdAttributes:['filename'],
      contentType: 'application/pdf',
      qualificationLabel: 'health_invoice'
    })
  }

  async authWithCredentials(){
    await this.goto(LOGIN_URL)
    await this.waitForElementInWorker('a')
    const isAskingForDownload = await this.runInWorker('checkAskForAppDownload')
    if(isAskingForDownload){
      await this.clickAndWait('a[href="#"]','div[class="ListItem ListItem__Clickable ListCareEventItem"]')
    }
    // await this.waitForElementInWorker('.HelpButton')
    const isLogged = await this.runInWorker('checkIfLogged')
    if(isLogged){
      return true
    }
    await this.waitForElementInWorker('[pauseWithCred]')
    await this.clickAndWait('a[href="/login"]', 'input[name="password"]' )
  }

  async authWithoutCredentials(){
    await this.goto(BASE_URL)
    await this.waitForElementInWorker('a[href="/login"]')
    await this.clickAndWait('a[href="/login"]', 'a' )
    await this.waitForElementInWorker('a')
    const isAskingForDownload = await this.runInWorker('checkAskForAppDownload')
    if(isAskingForDownload){
      await this.clickAndWait('a[href="#"]','div[class="ListItem ListItem__Clickable ListCareEventItem"]')
    }
    await this.waitForUserAuthentication()
    await this.saveCredentials(this.store.userCredentials)
    const isAskingForDownloadAgain = await this.runInWorker('checkAskForAppDownload')
    if(isAskingForDownloadAgain){
      await this.clickAndWait('a[href="#"]','div[class="ListItem ListItem__Clickable ListCareEventItem"]')
    }
    return true
  }


  //////////
  //WORKER//
  //////////


  async checkAuthenticated() {
    const loginField = document.querySelector('input[name="email"]')
    const passwordField = document.querySelector('input[name="password"]')
    if (loginField && passwordField) {
      const userCredentials = await this.findAndSendCredentials.bind(this)(loginField, passwordField)
      this.log('Sendin userCredentials to Pilot')
      this.sendToPilot({
        userCredentials
      })
    }
    if(document.location.href.includes(`${HOMEPAGE_URL}`) && document.querySelector('a[href="#"]') || document.querySelector('div[class="murray__NavListItem"]')){
      this.log('Auth Check succeeded')
      return true
    }
    this.log('Not respecting condition, returning false')
    return false
  }

  async findAndSendCredentials(login, password){
    this.log('findAndSendCredentials starts')
    let userLogin = login.value
    let userPassword = password.value
    const userCredentials = {
      login : userLogin,
      password : userPassword
    }
    return userCredentials
  }

  checkAskForAppDownload() {
    if(document.querySelector('a[href="#"]')){
      return true
    }else{
      return false
    }
  }

  checkIfLogged(){
    if(document.location.href === HOMEPAGE_URL){
      return true
    }else{
      return false
    }
  }

  getUserMail() { 
    const userInfosElements = document.querySelectorAll('.value-box-value')
    const userMail = userInfosElements[3].innerHTML
    if (userMail) {
      return userMail
    }
    return 'UNKNOWN_ERROR'
  }

  async getUserIdentity(){
    const tokenPayload = window.localStorage.tokenPayload
    const tokenBearer = window.localStorage.token
    const beneficiaryId = tokenPayload.split(',')[1].replace(/"/g,'').split(':')[1]
    const apiUrl = `https://api.alan.com/api/users/${beneficiaryId}?expand=visible_insurance_documents,address,beneficiaries,beneficiaries.insurance_profile.user,beneficiaries.insurance_profile.latest_tp_card`
    const response = await window.fetch(apiUrl, {
      headers: {
        Authorization:`Bearer ${tokenBearer}`
      }
    }).then(response => response.text())
    const jsonDocuments = JSON.parse(response)

    const email = jsonDocuments.email
    const socialSecurityNumber = jsonDocuments.beneficiaries[0].insurance_profile.ssn
    const birthDate = jsonDocuments.birth_date
    const firstName = jsonDocuments.first_name
    const lastName = jsonDocuments.last_name
    const postCode = jsonDocuments.address.postal_code
    const city = jsonDocuments.address.city
    const street = jsonDocuments.address.street
    const country = jsonDocuments.address.country

    const userIdentity = {
      email,
      birthDate,
      socialSecurityNumber,
      name : {
        firstName,
        lastName,
        fullname : `${firstName} ${lastName}`
      },
      address: [
        {
          formattedAddress : `${street} ${postCode} ${city} ${country}`,
          postCode,
          city,
          street,
          country
        }
      ]
    }
    await this.sendToPilot({userIdentity, jsonDocuments})
  }

  async getDocuments(jsonDocuments){
    let {bills, tpCardIdentifier, beneficiariesWithIds } = await this.computeDocuments(jsonDocuments)
    this.computeGroupAmounts(bills)
    this.linkFiles(bills, beneficiariesWithIds)
    await this.getTpCard(tpCardIdentifier)
    await this.sendToPilot({bills})
  }

  async computeDocuments(jsonDocuments){
    const tokenBearer = window.localStorage.token
    const beneficiaries = jsonDocuments.beneficiaries
    let beneficiariesWithIds = []
    for (const beneficiary of beneficiaries){
      const name = beneficiary.insurance_profile.user.normalized_full_name
      const beneficiaryId = beneficiary.insurance_profile_id
      const userId = beneficiary.insurance_profile.user.id
      beneficiariesWithIds.push({
        name,
        beneficiaryId,
        userId
      })
    }
    const apiUrl = `https://api.alan.com/api/insurance_profiles/${beneficiariesWithIds[0].beneficiaryId}/care_events_public`
    let response = await window.fetch(apiUrl, {
      headers: {
        Authorization:`Bearer ${tokenBearer}`
      }
    }).then(response => response.text())
    const jsonEvents = JSON.parse(response)

  let bills = []
  for (const beneficiary of beneficiaries) {
    const name = beneficiary.insurance_profile.user.normalized_full_name
    bills.push.apply(
      bills,
      jsonEvents
        .filter(bill => bill.status === 'refunded')
        .map(bill => ({
          vendor: 'alan',
          vendorRef: bill.id,
          beneficiary: name,
          type: 'health_costs',
          date: moment(bill.estimated_payment_date, 'YYYY-MM-DD').toDate(),
          originalDate: moment(bill.care_date, 'YYYY-MM-DD').toDate(),
          subtype: bill.care_acts[0].display_label,
          socialSecurityRefund: bill.care_acts[0].ss_base / 100,
          amount: bill.care_acts[0].reimbursed_to_user / 100,
          originalAmount: bill.care_acts[0].spent_amount / 100,
          isThirdPartyPayer: bill.care_acts[0].reimbursed_to_user === null,
          currency: '€',
          isRefund: true,
          fileAttributes: {
            metadata: {
              contentAuthor: 'alan.com',
              issueDate: new Date(),
              datetime: moment(bill.care_date, 'YYYY-MM-DD').toDate(),
              datetimeLabel: `issueDate`,
              isSubscription: false,
              carbonCopy: true
            }
          }
        }))
    )
  }
  const tpCardIdentifier = jsonDocuments.tp_card_identifier.replace(/\s/g, '')

  return {bills, tpCardIdentifier, beneficiariesWithIds}
  }

  computeGroupAmounts(bills) {
    this.log('Starting computeGroupAmount')
    // find groupAmounts by date
    const groupedBills = groupBy(bills, 'date')
    bills = bills.map(bill => {
      if (bill.isThirdPartyPayer) return bill
      const groupAmount = groupedBills[bill.date]
        .filter(bill => !bill.isThirdPartyPayer)
        .reduce((memo, bill) => memo + bill.amount, 0)
      if (groupAmount > 0 && groupAmount !== bill.amount)
        bill.groupAmount = parseFloat(groupAmount.toFixed(2))
      return bill
    })
    this.log('Ending computeGroupAmount')
  }

  linkFiles(bills, beneficiariesWithIds) {
    const tokenBearer = window.localStorage.token
    let currentMonthIsReplaced = false
    let previousMonthIsReplaced = false
    bills = bills.map(bill => {
      bill.fileurl = `https://api.alan.com/api/users/${
        beneficiariesWithIds[0].userId
      }/decomptes?year=${moment(bill.date).format('YYYY')}&month=${moment(
        bill.date
      ).format('M')}`
      bill.filename = `${moment(bill.date).format('YYYY_MM')}_alan.pdf`
      const currentMonth = Number(moment().format('M'))
      const previousMonth = Number(
        moment()
          .startOf('month')
          .subtract(1, 'days')
          .format('M')
      )
      bill.shouldReplaceFile = (file, doc) => {
        const docMonth = Number(moment(doc.date).format('M'))
        const isCurrentMonth = docMonth === currentMonth
        const isPreviousMonth = docMonth === previousMonth
  
        // replace current month file only one time
        if (isCurrentMonth && !currentMonthIsReplaced) {
          currentMonthIsReplaced = true
          return true
        }
        if (isPreviousMonth && !previousMonthIsReplaced) {
          previousMonthIsReplaced = true
          return true
        }
        return false
      }
      bill.requestOptions = {
        headers: {
          Authorization:`Bearer ${tokenBearer}`
        }
      }
      return bill
    })
  }

  async getTpCard(tpCardIdentifier) {
    console.log('tpCardId', tpCardIdentifier)
    const tokenBearer = window.localStorage.token
    let tpCard = []
    tpCard.push({
      fileurl: `https://api.alan.com/api/users/${tpCardIdentifier}/tp-card?t=${Date.now()}`,
      filename: 'Carte_Mutuelle.pdf',
      fileAttributes: {
        metadata: {
          contentAuthor: 'alan.com',
          datetime: new Date(),
          datetimeLabel: `issueDate`,
          isSubscription: false,
          carbonCopy: true,
        }
      },
      shouldReplaceFile: () => true,
      requestOptions: {
        headers: {
          Authorization:`Bearer ${tokenBearer}`
        }
      }
    })
    await this.sendToPilot({tpCard})
  }

}

const connector = new TemplateContentScript()
connector.init({ additionalExposedMethodsNames: [
  'checkAskForAppDownload',
  'checkIfLogged',
  'getUserMail',
  'getUserIdentity',
  'getDocuments',
] }).catch(err => {
  console.warn(err)
})