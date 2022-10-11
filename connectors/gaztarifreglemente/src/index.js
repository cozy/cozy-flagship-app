import ContentScript from '../../connectorLibs/ContentScript'
import {format} from 'date-fns'
import Minilog from '@cozy/minilog'
const log = Minilog('ContentScript')
Minilog.enable('gaztarifreglementeCCC')

let XHRResponses = []
var proxied = window.XMLHttpRequest.prototype.open
window.XMLHttpRequest.prototype.open = function (){
  if (arguments[1].includes('digitaltr-facture/api/private/facturesarchives?')) {
    var originalResponse = this
    originalResponse.addEventListener('readystatechange', async function (event) {
      if (originalResponse.readyState === 4) {
        const jsonResponse = JSON.parse(originalResponse.responseText)
        XHRResponses.push(jsonResponse)
          // In every case, always returning the original response untouched
        return originalResponse
      }
    })
  }
  return proxied.apply(this, [].slice.call(arguments))
}

const DEFAULT_SOURCE_ACCOUNT_IDENTIFIER = 'gaz tarif reglemente'
const LOGIN_URL = 'https://gaz-tarif-reglemente.fr/login-page.html'
const HOMEPAGE_URL = 'https://gaz-tarif-reglemente.fr/espace-client-tr/synthese.html'
class TemplateContentScript extends ContentScript {
  //////////
  //PILOT //
  //////////
  async ensureAuthenticated() {
    this.log('Starting ensureAuthenticated')
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

  async authWithCredentials (credentials){
    this.log('Starting authWithCredentials')
    await this.goto(HOMEPAGE_URL)
    await this.waitForElementInWorker('#cai-webchat-div')
    await Promise.race([
      this.waitForElementInWorker('#email'),
      this.waitForElementInWorker('#header-deconnexion')
    ])
    const isLogged = await this.runInWorker('checkIfLogged')
    if(isLogged){
      await this.clickAndWait('#header-deconnexion', '#idEspaceClientDiv')
      await this.clickAndWait('#idEspaceClientDiv', '#email')
    }
    const isSuccess = await this.tryAutoLogin(credentials)
    if(isSuccess){
      return true
    }else{
      this.log('Something went wrong while autoLogin, new auth needed')
      this.waitForUserAuthentication()
    }
  }

  async authWithoutCredentials (){
    this.log('Starting authWithoutCredentials')
    await this.goto(LOGIN_URL)
    await this.waitForElementInWorker('#email')
    await this.waitForUserAuthentication()
    await this.saveCredentials(this.store.userCredentials)
  }

  async waitForUserAuthentication() {
    this.log('waitForUserAuthentication starts')
    await this.setWorkerState({visible: true})
    await this.runInWorkerUntilTrue({method: 'waitForAuthenticated'})
    await this.setWorkerState({visible: false})
    // Here wee need to save what we have in the interception
    // as it is emptyed before we actually use it
    await this.runInWorkerUntilTrue({method: 'waitForInterception'})
  }


  async getUserDataFromWebsite() {
    this.log('Starting getUserDataFromWebsite')
    await this.waitForElementInWorker('a[href="/espace-client-tr/profil-et-contrats.html"]')
    await this.runInWorker('click', 'a[href="/espace-client-tr/profil-et-contrats.html"]')
    // Here we need to make sure every elements we will need for getUserIdentity to work
    // are present. Datas are not loaded at the very same time, resulting in html elements
    // visible but not fullfilled entirely, so this slows down a bit the execution but
    // it's supposed to let time for the datas to be injected.
    await Promise.all([
      this.waitForElementInWorker('#idEmailContact_Infos'),
      this.waitForElementInWorker('#ProfilConsulterAdresseFacturation_nomComplet'),
      this.waitForElementInWorker('#ProfilConsulterAdresseFacturation_adresse'),
      this.waitForElementInWorker('#ProfilConsulterAdresseFacturation_complementAdresse'),
      this.waitForElementInWorker('#ProfilConsulterAdresseFacturation_commune'),
      this.waitForElementInWorker('#idNumerosTelephone_Infos')
    ])
    await this.runInWorker('getUserIdentity')
    await this.runInWorker('click', 'a[href="/espace-client-tr/factures-et-paiements.html"]')
    await this.waitForElementInWorker('#factures-listeFacture')
    await this.runInWorker('getUserDatas', this.store.XHRResponses)
    if(this.store.userIdentity.email){
      return { sourceAccountIdentifier : this.store.userIdentity.email }
    } else {
      this.log("Couldn't get a sourceAccountIdentifier, using default")
      return { sourceAccountIdentifier: DEFAULT_SOURCE_ACCOUNT_IDENTIFIER }
    }
  }
  
  async fetch(context) {
    this.log('Starting fetch')
    await this.saveBills(this.store.bills, {
      context,
      keys: ['vendorRef'],
      contentType: 'application/pdf',
      fileIdAttributes: ['filename'],
      qualificationLabel: 'energy_invoice'
    })
    await this.clickAndWait('#header-deconnexion', '#idEspaceClientDiv')
  }

  async tryAutoLogin(credentials,) {
    this.log('Trying autologin')
    const isSuccess = await this.autoLogin(credentials)
    return isSuccess
  }

  async autoLogin(credentials) {
    this.log('Starting autologin')
    const selectors = {
      email: '#email',
      password: '#motdepasse',
      loginButton : '#login-btn'
    }
    await this.waitForElementInWorker(selectors.loginButton)
    await this.runInWorker('handleForm', {selectors, credentials})
    await this.runInWorkerUntilTrue({method: 'waitForInterception'})
    await this.runInWorkerUntilTrue({method: 'checkIfLoggedWithAutoLogin'})
    return true
  }


  //////////
  //WORKER//
  //////////


  async checkAuthenticated() {
    this.log('Starting checkAuthenticated')
    const loginField = document.querySelector('#email')
    const passwordField = document.querySelector('#motdepasse')
    if (loginField && passwordField) {
      const userCredentials = await this.findAndSendCredentials.bind(this)(loginField, passwordField)
      this.log('Sendin userCredentials to Pilot')
      this.sendToPilot({
        userCredentials
      })
    }
    if(document.location.href.includes('espace-client-tr/synthese.html') && document.querySelector('#header-deconnexion')){
      this.log('Auth Check succeeded')
      return true
    }
    this.log('Not respecting condition, returning false')
    return false
  }

  async findAndSendCredentials(login, password){
    this.log('Starting findAndSendCredentials')
    let userLogin = login.value
    let userPassword = password.value
    const userCredentials = {
      login : userLogin,
      password : userPassword
    }
    return userCredentials
  }

  async waitForInterception(){
    this.log('Starting waitForInterception')
    while(XHRResponses.length === 0){
      return false
    }
    await this.sendToPilot({XHRResponses})
    return true
  }

  async checkIfLogged() {
    this.log('Starting checkIfLogged')
    const mailInput = document.querySelector('#email')
    const logoutButton = document.querySelector('#header-deconnexion')
    if(mailInput){
      return false
    }
    if (logoutButton){
      return true
    }
  }

  async handleForm(loginData){
    this.log('Starting handleForm')
    const loginElement = document.querySelector(loginData.selectors.email)
    const passwordElement = document.querySelector(loginData.selectors.password)
    const submitButton = document.querySelector(loginData.selectors.loginButton)
    loginElement.value = loginData.credentials.login
    passwordElement.value = loginData.credentials.password
    submitButton.click()
  }

  async checkIfLoggedWithAutoLogin(){
    if(document.location.href.includes(HOMEPAGE_URL) && document.querySelector('#blocData')){
      return true
    }
    return false
  }

  async getUserIdentity(){
    const email = document.querySelector('#idEmailContact_Infos').innerHTML
    const rawFullName = document.querySelector('#ProfilConsulterAdresseFacturation_nomComplet').innerHTML
    const {[1]:firstName, [2]:lastName} = rawFullName.split(' ')
    const street = document.querySelector('#ProfilConsulterAdresseFacturation_adresse').innerHTML
    const addressComplement = document.querySelector('#ProfilConsulterAdresseFacturation_complementAdresse').innerHTML
    const [postCode, city] = document.querySelector('#ProfilConsulterAdresseFacturation_commune').innerHTML.split(' ')
    const phoneNumber = document.querySelector('#idNumerosTelephone_Infos').innerHTML.replace(/\./g, '')
    let userIdentity = {
      email,
      name : {
        firstName,
        lastName,
        fullName:`${firstName} ${lastName}`
      },
      address : [{
        street,
        postCode,
        city
      }],
      phone: [
        {
          type: phoneNumber.match(/^06|07|\+336|\+337/g)? 'mobile' : 'home',
          number: phoneNumber
        }
      ]
    }
    if(addressComplement !== "Etage : ."){
      userIdentity.address[0].addressComplement = addressComplement
      userIdentity.address[0].fullAddress = `${street} ${addressComplement} ${postCode} ${city}`
    }
    if(addressComplement === "Etage : ." | null | undefined){
      userIdentity.address[0].fullAddress = `${street} ${postCode} ${city}`
    }
    await this.sendToPilot({userIdentity})

  }

  async getUserDatas(datasToCompute){
    this.log('Starting getUserDatas')
    let bills = []

    for (let bill of datasToCompute[0].listeFactures){
      const amount = bill.montantTTC.montant
      const currency = '€'
      const documentType = bill.libelle
      const billDate = new Date(bill.dateFacture)
      const formattedDate = format(billDate, 'dd_MM_yyyy')
      const vendorRef = bill.numeroFacture
      const decodeFileHref = `${decodeURIComponent(bill.url)}`
      const doubleEncodedFileHref = encodeURIComponent(encodeURIComponent(decodeFileHref))
      const doubleEncodedNumber = encodeURIComponent(encodeURIComponent(`N°${vendorRef}`))
      const computedBill = {
        amount,
        currency,
        fileurl : `https://gaz-tarif-reglemente.fr/digitaltr-util/api/private/document/mobile/attachment/${doubleEncodedFileHref}/SAE/${formattedDate.replace(/_/g, '')}-${doubleEncodedNumber}.pdf?`,
        filename : `${formattedDate}_Gaz-tarif-reglemente_${amount}${currency}.pdf`,
        documentType,
        billDate,
        vendor: 'Gaz Tarif Réglementé',
        vendorRef,
        fileAttributes : {
          metadata: {
            contentAuthor : 'gaz tarif réglementé',
            datetime: billDate,
            datetimeLabel: 'issueDate',
            isSubscription: true,
            issueDate: new Date(),
            carbonCopy : true
          }
        }
      }
      bills.push(computedBill)
    }
    await this.sendToPilot({bills})
  }

}

const connector = new TemplateContentScript()
connector.init({ additionalExposedMethodsNames: [
  'checkIfLogged',
  'handleForm',
  'checkIfLoggedWithAutoLogin',
  'getUserIdentity',
  'getUserDatas',
  'waitForInterception'
] }).catch(err => {
  console.warn(err)
})
