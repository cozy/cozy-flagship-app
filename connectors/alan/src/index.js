import ContentScript from '../../connectorLibs/ContentScript'
import {kyScraper as ky, blobToBase64} from '../../connectorLibs/utils'
import Minilog from '@cozy/minilog'
const log = Minilog('ContentScript')
const moment = require('moment')
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
    // We need to force Desktop version of the website, otherwise some pages won't be accessible on mobile
    await this.bridge.call(
      'setUserAgent',
      'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:94.0) Gecko/20100101 Firefox/94.0',
    )
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
    await this.goto(PERSONAL_INFOS_URL)
    await this.waitForElementInWorker('.email-wrapper')
    const sourceAccountId = await this.runInWorker('getUserMail')
    await this.waitForElementInWorker('.address-wrapper')
    await this.runInWorker('getUserIdentity')
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
    await this.runInWorker('getDocuments')
    await this.waitForElementInWorker('[pause]')
  }

  async authWithCredentials(){
    await this.goto(LOGIN_URL)
    await this.waitForElementInWorker('.HelpButton')
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
    await this.clickAndWait('a[href="/login"]', 'input[name="password"]' )
    await this.waitForUserAuthentication()
    await this.saveCredentials(this.store.userCredentials)
    const isAskingForDownload = await this.runInWorker('checkAskForAppDowload')
    if(isAskingForDownload){
      await this.clickAndWait('a[href="#"]','div[class="murray__NavList"]')
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

  checkAskForAppDowload() {
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
    const nameElement = document.querySelector('h4').innerHTML.split('&nbsp;')
    const nameString = nameElement[0]
    const givenName = nameString.split(' ')[0]
    const familyName = nameString.split(' ')[1]
    const userInfosElements = document.querySelectorAll('.value-box-value')
    const birthDate = userInfosElements[0].textContent.split('M')[0]
    const socialSecurityNumber = userInfosElements[1].children[0].children[1].children[0].textContent
    const email = userInfosElements[3].innerHTML
    const address = userInfosElements[5].innerHTML.split(', ')
    const street = address[0]
    const postCode = address[1]
    const city = address[2]
    const userIdentity = {
      email,
      birthDate,
      socialSecurityNumber,
      name : {
        givenName,
        familyName,
        fullname : `${givenName} ${familyName}`
      },
      address: [
        {
          formattedAddress : `${street} ${postCode} ${city}`,
          postCode,
          city,
          street
        }
      ]
    }
    await this.sendToPilot({userIdentity})
  }

  async getDocuments(){
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
    let {bills, tpCardIdentifier } = await this.computeDocuments(jsonDocuments)
  }

  async computeDocuments(jsonDocuments){
    const tokenBearer = window.localStorage.token
    const beneficiaries = jsonDocuments.beneficiaries
    let beneficiariesWithIds = []
    for (const beneficiary of beneficiaries){
      const name = beneficiary.insurance_profile.user.normalized_full_name
      const beneficiaryId = beneficiary.insurance_profile_id
      beneficiariesWithIds.push({
        name,
        beneficiaryId
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

  return {bills, tpCardIdentifier}
  }

}

const connector = new TemplateContentScript()
connector.init({ additionalExposedMethodsNames: [
  'checkAskForAppDowload',
  'checkIfLogged',
  'getUserMail',
  'getUserIdentity',
  'getDocuments',
] }).catch(err => {
  console.warn(err)
})