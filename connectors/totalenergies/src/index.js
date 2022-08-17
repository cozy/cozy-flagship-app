import ContentScript from '../../connectorLibs/ContentScript'
import Minilog from '@cozy/minilog'
const log = Minilog('ContentScript')
Minilog.enable('totalenergiesCCC')

const baseUrl = 'https://www.totalenergies.fr/'
const MAINTENANCE_URL = 'https://maintenance.direct-energie.com'
const HOMEPAGE_URL = 'https://www.totalenergies.fr/clients/accueil#fz-authentificationForm'

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
    await this.clickAndWait('a[href="/clients/mon-compte"]', 'a[href="/clients/mon-compte/mes-infos-de-contact"]')
    await this.clickAndWait('a[href="/clients/mon-compte/mes-infos-de-contact"]', 'div[class="pb-dm"]')
    await this.runInWorker('getIdentity')
    const sourceAccountId = await this.runInWorker('getUserMail')
    if(sourceAccountId === 'UNKNOWN_ERROR'){
      this.log("Couldn't find a sourceAccountIdentifier, using default")
      return {sourceAccountIdentifier: DEFAULT_SOURCE_ACCOUNT_IDENTIFIER}
    }
    return {sourceAccountIdentifier: sourceAccountId}
  }
  
  async fetch(context) {
    await this.clickAndWait('a[href="/clients/mes-factures/mes-factures-et-paiements"]', 'a[href="/clients/mes-factures/mes-factures-electricite/mon-historique-de-factures"]')
    await this.clickAndWait('a[href="/clients/mes-factures/mes-factures-electricite/mon-historique-de-factures"]', '.detail-facture')
    const billsDone = await this.runInWorker('getBills')
    if(billsDone){
      await this.clickAndWait('a[href="/clients/mon-compte/mon-contrat"]', '.cadre2')
      await this.runInWorker('getContract')
      await this.saveIdentity(this.store.userIdentity)
      await this.saveBills(this.store.allDocuments, {
        context,
        fileIdAttributes: ['vendorRef', 'filename'],
        contentType: 'application/pdf',
        qualificationLabel: 'energy_invoice'
      })
      await this.saveFiles(this.store.contract, {
        context,
        fileIdAttributes: ['filename'],
        contentType: 'application/pdf',
        qualificationLabel: 'energy_contract'
      })
    }
    
  }
  
  async authWithCredentials(credentials){
    this.log('auth with credentials starts')
    await this.goto(baseUrl)
    await this.waitForElementInWorker('a[class="menu-p-btn-ec"]')
    await this.runInWorker('clickLoginPage')
    await Promise.race([
      this.waitForElementInWorker('.menu-btn--deconnexion'),
      this.waitForElementInWorker('#formz-authentification-form-login')
    ])
    const alreadyLoggedIn = await this.runInWorker('checkIfLogged')
    if(alreadyLoggedIn){
      return true
    }
    else {
      await this.tryAutoLogin(credentials)
    }
  }

  async authWithoutCredentials(){
    this.log('auth without credentials starts')
    await this.goto(baseUrl)
    await this.waitForElementInWorker('a[class="menu-p-btn-ec"]')
    await this.runInWorker('clickLoginPage')
    const maintenanceStatus = await this.runInWorker('checkMaintenanceStatus')
    if (maintenanceStatus){
      throw new Error('VENDOR_DOWN')
    }
    await this.waitForElementInWorker('#formz-authentification-form-password')
    await this.waitForUserAuthentication()
    await this.saveCredentials(this.store.userCredentials)
    return true
  }

  async tryAutoLogin(credentials) {
    this.log('Trying auto login')
    await this.autoLogin(credentials)
    if(await this.checkAuthenticated()){
      return true
    }
  }

  async autoLogin(credentials) {
    this.log('AutoLogin starts')
    await this.waitForElementInWorker('#formz-authentification-form-login')
    await this.runInWorker('fillingForm', credentials)
    await this.runInWorker('click', '#formz-authentification-form-reste-connecte')
    await this.runInWorker('click', '#js--btn-validation')
  }
  
  //////////
  //WORKER//
  //////////
  
  async checkAuthenticated() {
    const loginField = document.querySelector('#formz-authentification-form-login')
    const passwordField = document.querySelector('#formz-authentification-form-password')
    if (loginField && passwordField) {
      const userCredentials = await this.findAndSendCredentials.bind(this)(loginField, passwordField)
      this.log('Sendin userCredentials to Pilot')
      this.sendToPilot({
        userCredentials
      })
    }
    if(document.location.href === HOMEPAGE_URL && document.querySelector('.menu-btn--deconnexion')){
      this.log('Auth Check succeeded')
      return true
    }
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

  async clickLoginPage(){
    const loginPageButton = this.getLoginPageButton()
    if (loginPageButton){
      loginPageButton.click()
      return true
    }
    this.log('No loginPage found')
    return false
  }

  getLoginPageButton(){
    const loginPageButton = document.querySelector('a[class="menu-p-btn-ec"]')
    return loginPageButton
  }

  async checkMaintenanceStatus(){
    const isInMaintenance = this.checkMaintenanceMessage()
    if (isInMaintenance){
      return true
    }
    return false
  }

  checkMaintenanceMessage(){
    const maintenanceMessage = document.querySelector('.big').innerHTML
    if (document.location.href === MAINTENANCE_URL && maintenanceMessage === 'Notre site est actuellement en maintenance.'){
      return true
    }else{
      return false
    }
  }

  async checkIfLogged(){
    if(document.querySelector('.menu-btn--deconnexion')){
      return true
    } 
    return false
  }

  fillingForm(credentials){
    const loginField = document.querySelector('#formz-authentification-form-login')
    const passwordField = document.querySelector('#formz-authentification-form-password')
    this.log('Filling fields with credentials')
    loginField.value = credentials.login
    passwordField.value = credentials.password
  }

  getUserMail(){
    const userMailElement = document.querySelectorAll('div[class="pb-dm"]')
    const userMail = userMailElement[1].querySelectorAll('strong')[1].innerHTML
    if(userMail) return userMail
    return 'UNKNOWN_ERROR'
  }

  async getIdentity(){
    this.log('getIdentity starts')
    const infosElements = document.querySelectorAll('div[class="pb-dm"]')
    const familyName = infosElements[0].querySelectorAll('strong')[0].innerHTML
    const name = infosElements[0].querySelectorAll('strong')[1].innerHTML
    const clientRef = infosElements[0].querySelectorAll('strong')[2].innerHTML
    const phoneNumber = infosElements[1].querySelectorAll('strong')[0].innerHTML
    const email = infosElements[1].querySelectorAll('strong')[1].innerHTML
    const rawAddress = infosElements[2].querySelectorAll('strong')[0].innerHTML.replaceAll('<br> ', '')
    const splittedAddress = rawAddress.match(/([0-9]*) ([A-Z\s-]*) ([0-9]{5}) ([A-Z0-9-\s\/]*)/)
    const fullAddress = splittedAddress[0]
    const houseNumber = splittedAddress[1]
    const street = splittedAddress[2]
    const postCode = splittedAddress[3]
    const city = splittedAddress[4]

    const userIdentity = {
      email,
      clientRef,
      name : {
        givenName : name,
        familyName
      },
      address : [{
        formattedAddress: fullAddress,
        houseNumber,
        street,
        postCode,
        city
      }],
      phone:[{
        type : phoneNumber.match(/^06|07|\+336|\+337/g) ? 'mobile' : 'home',
        number: phoneNumber
      }]
    }
    await this.sendToPilot({userIdentity})
  }

  async getBills(){
    this.log('getBills starts')
    const invoices = await this.getInvoices()
    const schedules = await this.getSchedules()
    const allDocuments = await this.computeInformations(invoices, schedules)
    await this.sendToPilot({allDocuments}) 
    return true
  }

  async getContract(){
    this.log('getContract starts')
    const contractElement = document.querySelector('.cadre2')
    const offerName = contractElement.querySelector('h2').innerHTML
    const rawStartDate = contractElement.querySelector('p[class="txt-gras"]').innerHTML
    const splittedStartDate = rawStartDate.split('/')
    const day = splittedStartDate[0]
    const month = splittedStartDate[1]
    const year = splittedStartDate[2]
    const startDate = new Date(year, month, day)
    const href = contractElement.querySelectorAll('.ml-std')[1].children[1].getAttribute('href')
    const fileurl = `https://www.totalenergies.fr${href}`
    const filename = `${day}-${month}-${year}_TotalEnergie_Contrat_${offerName.replaceAll(' ', '-')}.pdf`
    const contract = [{
      filename,
      fileurl,
      fileIdAttributes: ['filename'],
      vendor: 'Total Energies',
      offerName,
      fileAttributes: {
        metadata: {
          contentAuthor: 'totalenergies.fr',
          issueDate: new Date(),
          datetime: startDate,
          datetimeLabel: 'startDate',
          carbonCopy: true
        }
      }
    }]
    await this.sendToPilot({contract})
  }

  getInvoices() {
    const invoices = document.querySelectorAll('div[class="detail-facture"]')
    return invoices
  }

  getSchedules() {
    const schedulesInfos = document.querySelectorAll('.action__condition-conteneur-label')
    // const schedulesUrl = document.querySelectorAll('.action__display-zone > div[class="text-center mt-std"] > a')
    let schedules = []
    for (let i = 0; i < schedulesInfos.length; i++) {
      const schedulesObject = {
        element: schedulesInfos[i],
        downloadButton : schedulesInfos[i].nextElementSibling.children[1].children[0]
      }
      schedules.push(schedulesObject)
    }
    return schedules
  }

  computeInformations(invoices, schedules) {
    let computedInvoices = []
    for (let i = 0; i < invoices.length; i++){
      const vendorRef = invoices[i].children[0].children[2].innerHTML.match(/N° (.*)/)[1]
      const docTitle = invoices[i].children[0].children[0].innerHTML
      const rawDate = invoices[i].children[1].innerHTML
      const splitDate = rawDate.split('/')
      const day = splitDate[0]
      const month = splitDate[1]
      const year = splitDate[2]
      const rawPaymentStatus = invoices[i].children[2].innerHTML
      const paymentStatus = this.findBillStatus(rawPaymentStatus)
      const rawAmount = invoices[i].children[3].innerHTML.match(/([0-9]){1,},([0-9]){1,2}/g)
      const rawCurrency =  invoices[i].children[3].innerHTML.match(/€|\$|£/g)
      const currency = rawCurrency === '€' ? 'EUR' : rawCurrency[0]
      const href = invoices[i].children[4].getAttribute('href')
      const fileurl = `https://www.totalenergies.fr${href}`
      const amount = parseFloat(rawAmount[0].replace(',', '.'))
      const date = new Date(`${month}/${day}/${year}`)
      let invoice = {
        docTitle,
        filename : `${day}-${month}-${year}_TotalEnergies_${docTitle.replace(/ /g,'-')}_${amount}${currency}.pdf`,
        vendorRef,
        amount,
        date,
        currency,
        fileurl,
        fileIdAttributes: ['vendorRef'],
        vendor: 'Total Energies',
        fileAttributes: {
          metadata: {
            contentAuthor: 'totalenergies.fr',
            issueDate: new Date(),
            datetime: date,
            datetimeLabel: `issueDate`,
            invoiceNumber: `${vendorRef}`,
            isSubscription: true,
            carbonCopy: true
          }
        }
      }
      switch (paymentStatus) {
        case 'Paid':
          invoice.paymentStatus = paymentStatus
          invoice.paymentStatusDate = rawPaymentStatus.match(/[0-9]{2}\/[0-9]{2}\/[0-9]{4}/g)[0]
          break
        case 'Refunded':
          invoice.paymentStatus = paymentStatus
          invoice.paymentStatusDate = rawPaymentStatus.match(/[0-9]{2}\/[0-9]{2}\/[0-9]{4}/g)[0]
          invoice.isRefund = true
          break
        default:
          invoice.paymentStatus = paymentStatus
          break
      }
      computedInvoices.push(invoice)
    }
    let computedSchedules = []
    for (let j = 0; j < schedules.length; j++) {
      const vendorRef = schedules[j].element.children[0].children[2].innerHTML.match(/N° (.*)/)[1]
      const docTitle = schedules[j].element.children[0].children[0].innerHTML
      const rawDate = schedules[j].element.children[1].innerHTML
      const splitDate = rawDate.split('/')
      const day = splitDate[0]
      const month = splitDate[1]
      const year = splitDate[2]
      const rawPaymentStatus = schedules[j].element.children[2].innerHTML
      const paymentStatus = this.findBillStatus(rawPaymentStatus)
      const rawAmount = schedules[j].element.children[3].innerHTML.match(/([0-9]){1,},([0-9]){1,2}/g)
      const rawCurrency =  schedules[j].element.children[3].innerHTML.match(/€|\$|£/g)
      const currency = rawCurrency === '€' ? 'EUR' : rawCurrency[0]
      const href = schedules[j].downloadButton.getAttribute('href')
      const fileurl = `https://www.totalenergies.fr${href}`
      const amount = parseFloat(rawAmount[0].replace(',', '.'))
      const date = new Date(`${month}/${day}/${year}`)
      let schedule = {
        docTitle,
        filename : `${day}-${month}-${year}_TotalEnergies_${docTitle.replace(/ /g,'-')}_${amount}${currency}.pdf`,
        vendorRef,
        amount,
        date,
        currency,
        fileurl,
        fileIdAttributes: ['vendorRef'],
        vendor: 'Total Energies',
        fileAttributes: {
          metadata: {
            contentAuthor: 'totalenergies.fr',
            issueDate: new Date(),
            datetime: date,
            datetimeLabel: `issueDate`,
            invoiceNumber: `${vendorRef}`,
            isSubscription: true,
            carbonCopy: true
          }
        }
      }
      switch (paymentStatus) {
        case 'Paid':
          schedule.paymentStatus = paymentStatus
          schedule.paymentStatusDate = rawPaymentStatus.match(/([0-9]{2}\/[0-9]{2}\/[0-9]{4})/)
          break
        case 'Refunded':
          schedule.paymentStatus = paymentStatus
          schedule.paymentStatusDate = rawPaymentStatus.match(/[0-9]{2}\/[0-9]{2}\/[0-9]{4}/)
          schedule.isRefunded = true
          break
        default:
          schedule.paymentStatus = paymentStatus
          break
      }
      computedSchedules.push(schedule)
    }
    const computedDocs = computedInvoices.concat(computedSchedules)
    return computedDocs
  }

  findBillStatus(rawPaymentStatus){
    if(rawPaymentStatus.match('Payée')){
      return 'Paid'
    }
    else if(rawPaymentStatus.match('Terminé')){
      return 'Ended'
    }
    else if(rawPaymentStatus.match('Remboursée')){
      return 'Refunded'
    }
    else {
      this.log('Unknown status, returning as it is')
      return rawPaymentStatus
    }  
  }
}

const connector = new TemplateContentScript()
connector.init({ additionalExposedMethodsNames: [
  'clickLoginPage',
  'checkMaintenanceStatus',
  'getUserMail',
  'getBills',
  'fillingForm',
  'checkIfLogged',
  'getIdentity',
  'getContract',
] }).catch(err => {
  console.warn(err)
})