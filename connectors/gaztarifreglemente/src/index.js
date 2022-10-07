import ContentScript from '../../connectorLibs/ContentScript'
import {kyScraper as ky, blobToBase64} from '../../connectorLibs/utils'
import Minilog from '@cozy/minilog'
const log = Minilog('ContentScript')
Minilog.enable('gaztarifreglementeCCC')
import { interceptXHRResponse} from './XHRinterceptor'


// let XHRResponses = {
//   path : 'digitaltr-facture/api/private/facturesarchives?'
// }
let XHRResponses = []
//SAME SH*T
var proxied = window.XMLHttpRequest.prototype.open
window.XMLHttpRequest.prototype.open = function (){
    if (arguments[1].includes('digitaltr-facture/api/private/facturesarchives?')) {
        var originalResponse = this
        originalResponse.addEventListener('readystatechange', async function (event) {
          console.log('Starting EventListener')
            if (originalResponse.readyState === 4) {
                const jsonResponse = JSON.parse(originalResponse.responseText)
                await interceptDatas(jsonResponse)
                // In every case, always returning the original response untouched
                return originalResponse
            }
        })
    }
    return proxied.apply(this, [].slice.call(arguments))
}

//Intercepting XHR response for api response
// let XHRResponses = [
//   'digitaltr-facture/api/private/facturesarchives?'
// ]
// interceptXHRResponse(XHRResponses)

// let XHRResponses = interceptXHRResponse('digitaltr-facture/api/private/facturesarchives?')

const BASE_URL = 'https://gaz-tarif-reglemente.fr/'
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
    const isLogged = await this.runInWorker('checkIfLogged')
    if(isLogged){
      await this.runInWorker('click', 'a[href="/home/espace-client.html"]')
      await this.waitForElementInWorker('a[href="/home/espace-client/vos-factures-et-correspondances.html"]')
      return true
    }
    const isSuccess = await this.tryAutoLogin(credentials)
    if(isSuccess){
      return true
    }else{
      this.log('Something went wrong while autoLogin, new auth needed')
      this.waitForUserAuthentication()
    }
    
    await this.waitForElementInWorker('[pauseWithCred]')
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
  }


  async getUserDataFromWebsite() {
    await this.waitForElementInWorker('a[href="/espace-client-tr/profil-et-contrats.html"]')
    await this.runInWorker('click', 'a[href="/espace-client-tr/profil-et-contrats.html"]')
    // Here we need to make sure every elements we will need for getUserData to work
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
    await this.runInWorker('getUserDatas')
    await this.waitForElementInWorker('[pauseFetch]')
  }
  
  async fetch(context) {

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

  checkIfLogged() {
    const mailInput = document.querySelector('#email')
    const includesUrl = document.location.href.includes('?URL_CIBLE=')
    const blocData = document.querySelector('#blocData')
    const logoutButton = document.querySelector('#header-deconnexion')
    if(mailInput && includesUrl){
      return false
    }
    if (blocData & logoutButton){
      return true
    }
    this.log('None of the wanted selectors are presents')
    return false
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

  checkIfLoggedWithAutoLogin(){
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

  async getUserDatas(){
    this.log('Starting getUserDatas')
    console.log('XHR interceptions : ', XHRResponses)
  }

}

const connector = new TemplateContentScript()
connector.init({ additionalExposedMethodsNames: [
  'checkIfLogged',
  'handleForm',
  'checkIfLoggedWithAutoLogin',
  'getUserIdentity',
  'getUserDatas'
] }).catch(err => {
  console.warn(err)
})

async function interceptDatas(response){
  console.log('XHRResponse before saving datas', XHRResponses)
  console.log('Trying to save datas', response)
  XHRResponses.push(response)
  await this.sendToPilot({XHRResponses})
  console.log('XHRResponse after saving datas', XHRResponses)
}