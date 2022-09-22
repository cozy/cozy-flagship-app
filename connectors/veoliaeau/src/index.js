import ContentScript from '../../connectorLibs/ContentScript'
import {kyScraper as ky, blobToBase64} from '../../connectorLibs/utils'
import Minilog from '@cozy/minilog'
const log = Minilog('ContentScript')
Minilog.enable('veoliaeauCCC')

const BASE_URL = 'https://www.service.eau.veolia.fr/home.html'
const HOMEPAGE_URL = 'https://www.service.eau.veolia.fr/home/espace-client.html#inside-space'

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
  
  async authWithCredentials (credentials){
    await this.goto(BASE_URL)
    await this.waitForElementInWorker('.block-bottom-area')
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
  }

  async authWithoutCredentials (){
    await this.goto(BASE_URL)
    await this.waitForElementInWorker('#veolia_username')
    await this.waitForUserAuthentication()
    await this.saveCredentials(this.store.userCredentials)
    await this.waitForElementInWorker('[pause]')
  }

  async waitForUserAuthentication() {
    this.log('waitForUserAuthentication starts')
    await this.setWorkerState({visible: true})
    await this.runInWorkerUntilTrue({method: 'waitForAuthenticated'})
    await this.setWorkerState({visible: false})
  }

  
  async getUserDataFromWebsite() {
    await this.waitForElementInWorker('[pause]')

  }
  
  async fetch(context) {
    
  }

  async tryAutoLogin(credentials,) {
    this.log('Trying autologin')
    const isSuccess = await this.autoLogin(credentials)
    return isSuccess
  }

  async autoLogin(credentials) {
    this.log('Autologin start')
    const selectors = {
      email: '#veolia_username',
      password: '#veolia_password',
      loginForm : '#loginBoxform_identification',
      loginButton : 'input[value="OK"]',
      captchaButton : '.frc-button'
    }
    await this.runInWorker('handleForm', {selectors, credentials})
    await this.waitForElementInWorker('a[href="/home/espace-client/vos-factures-et-correspondances.html"]')
    return true
  }


  //////////
  //WORKER//
  //////////


  async checkAuthenticated() {
    const loginField = document.querySelector('#veolia_username')
    const passwordField = document.querySelector('#veolia_password')
    if (loginField && passwordField) {
      const userCredentials = await this.findAndSendCredentials.bind(this)(loginField, passwordField)
      this.log('Sendin userCredentials to Pilot')
      this.sendToPilot({
        userCredentials
      })
    }
    if(document.location.href.includes(`${HOMEPAGE_URL}`) && document.querySelector('.block-deconnecte')){
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

  checkIfLogged(){
    this.log('Starting checkIfLogged')
    const loginForm = document.querySelector('#loginBoxform_identification')
    const logoutButton = document.querySelector('.block-deconnecte')
    if(loginForm){
      this.log('Login form detected, new auth needed')
      return false
    }
    if(logoutButton){
      this.log('Still connected, continue')
      return true
    }

  }

  async handleForm(loginData){
    this.log('Starting handleForm')
    const loginElement = document.querySelector(loginData.selectors.email)
    const passwordElement = document.querySelector(loginData.selectors.password)
    const captchaButton = document.querySelector(loginData.selectors.captchaButton)
    const submitButton = document.querySelector(loginData.selectors.loginForm).querySelector(loginData.selectors.loginButton)
    captchaButton.click()
    await this.checkRecaptcha()
    loginElement.value = loginData.credentials.login
    passwordElement.value = loginData.credentials.password
    submitButton.click()
  }

  async checkRecaptcha(){
    let captchaValue = document.querySelector('input[name="frc-captcha-solution"]').value
    while(captchaValue.length < 100){
      this.log('Recaptcha is not finished')
      await sleep(3)
      captchaValue = document.querySelector('input[name="frc-captcha-solution"]').value
    }
    return true
  }

  async getUserMail() {    
  }

}

const connector = new TemplateContentScript()
connector.init({ additionalExposedMethodsNames: [
  'checkIfLogged',
  'handleForm',
] }).catch(err => {
  console.warn(err)
})

function sleep(delay) {
  return new Promise(resolve => {
    setTimeout(resolve, delay * 1000)
  })
}