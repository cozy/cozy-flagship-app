import ContentScript from '../../connectorLibs/ContentScript'
import Minilog from '@cozy/minilog'
const log = Minilog('ContentScript')
import {format, subMonths} from 'date-fns'
import groupBy from 'lodash/groupBy'
Minilog.enable('alanCCC')

// Here we need to intercept the prehashed_password in the login's request
// to be able to make the autoLogin work on next connection.
let preHashedPassword
const constantMock = window.fetch
window.fetch = function(){
  if(arguments[0].includes !== undefined){
    if(arguments[0].includes('api.alan.com/auth/login')){
      if(arguments[1].data){
        preHashedPassword = arguments[1].data.prehashed_password
      }
      return constantMock.apply(this, arguments)
    }else{
      return constantMock.apply(this, arguments)
    }
  }
  return constantMock.apply(this, arguments)
}


const BASE_URL = 'https://alan.com/'
const LOGIN_URL = 'https://alan.com/login'
const HOMEPAGE_URL = 'https://alan.com/app/dashboard'

class TemplateContentScript extends ContentScript {
  //////////
  //PILOT //
  //////////
  async ensureAuthenticated() {
    const credentials = await this.getCredentials()
    if (credentials) {
      const auth = await this.authWithCredentials(credentials)
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
    if(this.store.loginResponse){
      await this.runInWorker('getUserDatas', this.store.loginResponse)
    }else{
      await this.runInWorker('getUserDatas')
    }
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
    await this.runInWorker('getDocuments', this.store.userDatas, this.store.loginResponse)
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
  
  async authWithCredentials(credentials){
    await this.goto(LOGIN_URL)
    await this.waitForElementInWorker('a')
    const isAskingForLogin = await this.runInWorker('checkAskForLogin')
    if (isAskingForLogin){
      const isSuccess = await this.tryAutoLogin(credentials)
      if(isSuccess){
        return true
      }
    }
    const isAskingForDownload = await this.runInWorker('checkAskForAppDownload')
    if(isAskingForDownload){
      await this.clickAndWait('a[href="#"]','div[class="ListItem ListItem__Clickable ListCareEventItem"]')
    }
    const isLogged = await this.runInWorker('checkIfLogged')
    if(isLogged){
      return true
    }
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

  async tryAutoLogin(credentials,) {
    this.log('Trying autologin')
    const isSuccess = await this.autoLogin(credentials)
    return isSuccess
  }

  async autoLogin(credentials) {
    this.log('Autologin start')
    const selectors = {
      email: 'input[name="email"]',
      password: 'input[name="password"]',
      loginButton : 'button[type="submit"]'
    }
    await this.waitForElementInWorker(selectors.email)
    const isSuccess = await this.runInWorker('makeLoginReq', credentials)
    return isSuccess
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
      password : userPassword,
      preHashedPassword
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

  async getUserDatas(loginResponse){
    const documentsUrl = 'https://api.alan.com/api/users/${beneficiaryId}?expand=visible_insurance_documents,address,beneficiaries,beneficiaries.insurance_profile.user,beneficiaries.insurance_profile.latest_tp_card'
    const jsonDocuments = await this.fetchAlanApi(documentsUrl, loginResponse)
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
    const eventsUrl = `https://api.alan.com/api/insurance_profiles/${beneficiariesWithIds[0].beneficiaryId}/care_events_public`
    const jsonEvents = await this.fetchAlanApi(eventsUrl, loginResponse)
    const {email, birth_date: birthDate, first_name: firstName, last_name: lastName, address} = jsonDocuments
    const socialSecurityNumber = jsonDocuments.beneficiaries[0].insurance_profile.ssn
    const {postal_code: postCode, city, street, country} = address
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
    const userDatas = {
      jsonDocuments,
      jsonEvents,
      beneficiariesWithIds
    }
    await Promise.all([this.sendToPilot({userDatas}), this.sendToPilot({userIdentity})])
  }

  async getDocuments(userDatas, loginResponse){
    let {bills, tpCardIdentifier} = await this.computeDocuments(userDatas.jsonDocuments, userDatas.jsonEvents)
    this.computeGroupAmounts(bills)
    this.linkFiles(bills, userDatas.beneficiariesWithIds, loginResponse)
    const tpCard = await this.getTpCard(tpCardIdentifier, loginResponse)
    await Promise.all([this.sendToPilot({tpCard}), this.sendToPilot({bills})])
  }

  async computeDocuments(jsonDocuments, jsonEvents){
    let bills = []
    for (const beneficiary of jsonDocuments.beneficiaries) {
      const name = beneficiary.insurance_profile.user.normalized_full_name
      bills.push.apply(
        bills,
        jsonEvents
          .filter(bill => bill.status === 'refunded')
          .map(function (bill){
            const originalDate = format(new Date(bill.care_date), 'yyyy-MM-dd')
            return {
              vendor: 'alan',
              vendorRef: bill.id,
              beneficiary: name,
              type: 'health_costs',
              date: format(new Date(bill.estimated_payment_date), 'yyyy-MM-dd'),
              originalDate,
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
                  datetime: originalDate,
                  datetimeLabel: `issueDate`,
                  isSubscription: false,
                  carbonCopy: true
                }
              }
            }
          })
      )
    }
    const tpCardIdentifier = jsonDocuments.tp_card_identifier.replace(/\s/g, '')

    return {bills, tpCardIdentifier}
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

  linkFiles(bills, beneficiariesWithIds, loginResponse) {
    let tokenBearer
    if (loginResponse){
      tokenBearer = loginResponse.token
    }else{
      tokenBearer = window.localStorage.token
    }
    let currentMonthIsReplaced = false
    let previousMonthIsReplaced = false
    bills = bills.map(bill => {
      bill.fileurl = `https://api.alan.com/api/users/${
        beneficiariesWithIds[0].userId
      }/decomptes?year=${format(new Date(bill.date), 'yyyy')}&month=${format(
        new Date(bill.date), 'MM'
      )}`
      bill.filename = `${format(new Date(bill.date), 'yyyy_MM')}_alan.pdf`
      const currentMonth = Number(format(new Date(), 'MM'))
      const previousMonth = Number(
        format(subMonths(currentMonth, 1), 'MM')
      )
      bill.shouldReplaceFile = (file, doc) => {
        const docMonth = Number(format(new Date(doc.date), 'MM'))
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

  async getTpCard(tpCardIdentifier, loginResponse) {
    let tokenBearer
    if (loginResponse){
      tokenBearer = loginResponse.token
    }else{
      tokenBearer = window.localStorage.token
    }
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
    return tpCard
  }

  checkAskForLogin(){
    if(document.querySelector('input[name="email"]') && document.querySelector('input[name="password"]')) return true
    return false
  }

  async makeLoginReq(credentials){
    let cookies = document.cookie
    const apiUrl = 'https://api.alan.com/auth/login'
    const loginResponse = await window.fetch(apiUrl, {
      "method": 'POST',
      "body" : `{"refresh_token_type":"web","email":"${credentials.login}","prehashed_password":"${credentials.preHashedPassword}"}`,
      "headers": {
        "Content-Type": "application/json",
        "Cookie": cookies,
        "X-APP-AUTH": "cookie"
      }
    }).then(res => res.json())

    cookies = document.cookie
    const tokenBearer = loginResponse.token
    const id = loginResponse.token_payload.id
    const redirectUrl = `https://api.alan.com/api/users/${id}/redirection_status`
    await window.fetch(redirectUrl, {
      "method": 'GET',
      "headers": {
        "Cookie": cookies,
        "Authorization":`Bearer ${tokenBearer}`
      },
      'referer': 'https://alan.com/app/dashboard'
    })

    if(!loginResponse.token){
      return false
    }
    await this.sendToPilot({loginResponse})
    return true
  }

  async fetchAlanApi(url, loginResponse){
    // Here we need to know in which login scenario we are.
    // First and second scenarii happens with "user actions", clicking and such.
    // Third scenario uses only API calls, so there is no "movement" in the worker.
    // As a result, localStorage is never filled up, so we need the login response
    // to actually have access to the token and the beneficiaryId
    let tokenBearer
    let beneficiaryId
    let tokenPayload
    if (loginResponse){
      tokenBearer = loginResponse.token
      beneficiaryId = loginResponse.token_payload.id
    }else{
      tokenBearer = window.localStorage.token
      tokenPayload = window.localStorage.tokenPayload
      beneficiaryId = tokenPayload.split(',')[1].replace(/"/g,'').split(':')[1]
    }
    // As we only need one time the beneficiaryId, we're checking if it is present in the url.
    if(url.includes('${beneficiaryId}')){
      // If true, we're using it
      url = url.replace('${beneficiaryId}', beneficiaryId)
    }
    const response = await window.fetch(url, {
       headers: {
        Authorization:`Bearer ${tokenBearer}`
      }
    })
    const jsonResponse = await response.json()
    return jsonResponse
  }

}

const connector = new TemplateContentScript()
connector.init({ additionalExposedMethodsNames: [
  'checkAskForAppDownload',
  'checkIfLogged',
  'getUserMail',
  'getUserDatas',
  'getDocuments',
  'checkAskForLogin',
  'makeLoginReq',
] }).catch(err => {
  console.warn(err)
})
