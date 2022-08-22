import ContentScript from '../../connectorLibs/ContentScript'
import {kyScraper as ky, blobToBase64} from '../../connectorLibs/utils'
import Minilog from '@cozy/minilog'
const log = Minilog('ContentScript')
Minilog.enable('redCCC')

const DEFAULT_SOURCE_ACCOUNT_IDENTIFIER = 'red'
const BASE_URL = 'https://www.red-by-sfr.fr'
const HOMEPAGE_URL = 'https://www.red-by-sfr.fr/mon-espace-client/?casforcetheme=espaceclientred#sfrclicid=EC_mire_Me-Connecter'
const CLIENT_SPACE_HREF = '//www.red-by-sfr.fr/mon-espace-client/?casforcetheme=espaceclientred#redclicid=X_Menu_EspaceClient'
const PERSONAL_INFOS_URL = 'https://espace-client-red.sfr.fr/infospersonnelles/contrat/informations'
const INFO_CONSO_URL = 'https://www.sfr.fr/routage/info-conso'
const BILLS_URL_PATH = '/facture-mobile/consultation#sfrintid=EC_telecom_mob-abo_mob-factpaiement'
const LOGOUT_URL = 'https://www.sfr.fr/cas/logout?red=true&url=https://www.red-by-sfr.fr'
const CLIENT_SPACE_URL = 'https://espace-client-red.sfr.fr'

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
    await this.waitForElementInWorker(`a[href="${PERSONAL_INFOS_URL}"]`)
    await this.clickAndWait(`a[href="${PERSONAL_INFOS_URL}"]`,'#emailContact' )
    const sourceAccountId = await this.runInWorker('getUserMail')
    await this.runInWorker('getIdentity')
    if (sourceAccountId === 'UNKNOWN_ERROR') {
      this.log("Couldn't get a sourceAccountIdentifier, using default")
      return { sourceAccountIdentifier: DEFAULT_SOURCE_ACCOUNT_IDENTIFIER }
    }
    return {
      sourceAccountIdentifier: sourceAccountId
    }
  }
  
  async fetch(context) {
    this.log('Fetch starts')
    await this.clickAndWait(`a[href="${INFO_CONSO_URL}"]`, `a[href="${BILLS_URL_PATH}"]`),
    await this.clickAndWait(`a[href="${BILLS_URL_PATH}"]`, 'button[onclick="plusFacture(); return false;"]'),
    await this.runInWorker('getMoreBills')
    await this.runInWorker('getBills')
    this.log('Saving files')
    await this.saveIdentity(this.store.userIdentity)
    await this.saveBills(this.store.allBills, {
      context,
      fileIdAttributes: ['filename'],
      contentType: 'application/pdf',
      qualificationLabel: 'phone_invoice'
    })

  }
  
  async authWithCredentials(){
    await this.goto(BASE_URL)
    await this.waitForElementInWorker(`a[href="${CLIENT_SPACE_HREF}"]`)
    await this.clickAndWait(`a[href="${CLIENT_SPACE_HREF}"]`, `a[href="${LOGOUT_URL}"]`)
    const reloginPage = await this.runInWorker('getReloginPage')
    if(reloginPage){
      this.log('Login expired, new authentication is needed')
      await this.waitForUserAuthentication()
      await this.saveCredentials(this.store.userCredentials)
      return true
    }
    return true
  }

  async authWithoutCredentials(){
    await this.goto(BASE_URL)
    await this.waitForElementInWorker(`a[href="${CLIENT_SPACE_HREF}"]`)
    await this.clickAndWait(`a[href="${CLIENT_SPACE_HREF}"]`, '#username')
    await this.waitForUserAuthentication()
    await this.saveCredentials(this.store.userCredentials)
    return true
  }
  
  //////////
  //WORKER//
  //////////
  

  async checkAuthenticated() {
    const loginField = document.querySelector('#username')
    const passwordField = document.querySelector('#password')
    if (loginField && passwordField) {
      const userCredentials = await this.findAndSendCredentials.bind(this)(loginField, passwordField)
      this.log('Sendin userCredentials to Pilot')
      this.sendToPilot({
        userCredentials
      })
    }
    if(document.location.href === HOMEPAGE_URL && document.querySelector('a[href="https://www.sfr.fr/cas/logout?red=true&url=https://www.red-by-sfr.fr"]')){
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
  
  async getUserMail() {  
    const userMailElement = document.querySelector('#emailContact').innerHTML
    this.log(userMailElement)
    if (userMailElement) {
      return userMailElement
    }
    return 'UNKNOWN_ERROR'
  }

  async getIdentity(){
    const givenName = document.querySelector('#nomTitulaire').innerHTML.split(' ')[0]
    const familyName = document.querySelector('#nomTitulaire').innerHTML.split(' ')[1]
    const address = document.querySelector('#adresseContact').innerHTML.replace(/\t/g,' ').replace(/\n/g, '')
    const unspacedAddress = address.replace(/(\s{2,})/g, ' ').replace(/^ +/g, '').replace(/ +$/g, '')
    const addressNumbers = unspacedAddress.match(/([0-9]{1,})/g)
    const houseNumber = addressNumbers[0]
    const postCode = addressNumbers[1]
    const addressWords = unspacedAddress.match(/([A-Z ]{1,})/g)
    const street = addressWords[0].replace(/^ +/g, '').replace(/ +$/g, '')
    const city = addressWords[1].replace(/^ +/g, '').replace(/ +$/g, '')
    const mobilePhoneNumber = document.querySelector('#telephoneContactMobile').innerHTML
    const homePhoneNumber = document.querySelector('#telephoneContactFixe').innerHTML
    const email = document.querySelector('#emailContact').innerHTML
    const userIdentity = {
      email,
      name : {
        givenName,
        familyName,
        fullname : `${givenName} ${familyName}`
      },
      address: [
        {
          formattedAddress : unspacedAddress,
          houseNumber,
          postCode,
          city,
          street
        }
      ],
      phone: [
        {
          type:'mobile',
          number : mobilePhoneNumber
        },
        {
          type:'home',
          number : homePhoneNumber
        }
      ]
    }
    await this.sendToPilot({userIdentity})
  }

  async getMoreBills() {
    const moreBillsSelector = 'button[onclick="plusFacture(); return false;"]'
    while(document.querySelector(`${moreBillsSelector}`) !== null) {
      this.log('moreBillsButton detected, clicking')
      const moreBillsButton = document.querySelector(`${moreBillsSelector}`)
      moreBillsButton.click()
      //Here, we need to wait for the older bills to load on the page
      await sleep(3)
    }
    this.log('No more moreBills button')
  }

  async getBills() {
    let allConcatBills = []
    const lastBill = await this.findLastBill()
    allConcatBills.push(lastBill)
    this.log('Last bill returned, getting old ones')
    const oldBills = await this.findOldBills()
    const allBills = allConcatBills.concat(oldBills)
    this.log('Old bills returned, sending to Pilot')
    await this.sendToPilot({
      allBills
    })
    this.log('getBills done')
  }
  
  async findLastBill() {
    const lastBillElement = document.querySelector('div[class="sr-inline sr-xs-block sr-margin-t-35"]')
    const rawAmount = lastBillElement.querySelectorAll('div')[0].querySelector('span').innerHTML
    const fullAmount = rawAmount.replace(/&nbsp;/g,'').replace(/ /g,'').replace(/\n/g,'')
    const amount = parseFloat(fullAmount.replace('€', ''))
    const currency = fullAmount.replace(/[0-9]*/g, '')
    const rawDate = lastBillElement.querySelectorAll('div')[1].querySelectorAll('span')[1].innerHTML
    const dateArray = rawDate.split('/')
    const day = dateArray[0]
    const month = dateArray[1]
    const year = dateArray[2]
    const rawPaymentDate = lastBillElement.querySelectorAll('div')[1].querySelectorAll('span')[0].innerHTML
    const paymentArray = rawPaymentDate.split('/')
    const paymentDay = paymentArray[0]
    const paymentMonth = paymentArray[1]
    const paymentYear = paymentArray[2]
    const filepath = lastBillElement.querySelectorAll('div')[4].querySelector('a').getAttribute('href')
    const fileurl =`${CLIENT_SPACE_URL}${filepath}`
    const lastBill = {
      amount,
      currency : currency === '€' ? 'EUR' : currency,
      date : new Date(`${month}/${day}/${year}`),
      paymentDate: new Date(`${paymentMonth}/${paymentDay}/${paymentYear}`),
      filename: await getFileName(rawDate, amount, currency),
      vendor: 'red',
      fileAttributes: {
        metadata: {
          contentAuthor: 'red',
          datetime: new Date(`${month}/${day}/${year}`),
          datetimeLabel: 'issueDate',
          isSubscription: true,
          issueDate: new Date(`${month}/${day}/${year}`),
          carbonCopy: true
        }
      }
    }
    // As it's impossible to have the pilot on the same domain as the worker
    // to match domain's specific cookie for the download to be done by saveFiles
    // we need to fetch the stream then pass it to the pilot
    const response = await ky.get(fileurl).blob()
    const dataUri = await blobToBase64(response)
    lastBill.dataUri = dataUri

    // if(lastBillElement.children[4].querySelectorAll('a')[1] !== undefined) {
    //   const detailedFilepath = lastBillElement.children[4].querySelectorAll('a')[1].getAttribute('href')
    //   const detailed = detailedFilepath.match('detail') ? true : false
    //   lastBill.filename = await getFileName(date, amount, currency, detailed)
    // }
    return lastBill

  }

  async findOldBills(){
    let oldBills = []
    const allBillsElements = document.querySelectorAll('div[class="sr-container-content-line"]')
    for (const oneBill of allBillsElements) {
      const rawAmount = oneBill.children[0].querySelector('span').innerHTML
      const fullAmount = rawAmount.replace(/&nbsp;/g,'').replace(/ /g,'').replace(/\n/g,'')
      const amount = parseFloat(fullAmount.replace('€', '').replace(',', '.'))
      const currency = fullAmount.replace(/[0-9]*/g, '').replace(',', '')
      const rawDate = oneBill.children[1].querySelector('span').innerHTML
      const dateArray = rawDate.split(' ')
      const day = dateArray[0]
      const month = computeMonth(dateArray[1])
      const year = dateArray [2]
      const date = `${day}-${month}-${year}`
      const rawPaymentDate = oneBill.children[1].innerHTML.replace(/\n/g,'').replace(/ /g,'').match(/([0-9]{2}[a-zûé]{3,4}.?-)/g)
      const filepath = oneBill.children[4].querySelector('a').getAttribute('href')
      const fileurl = `${CLIENT_SPACE_URL}${filepath}`
      
      
      let computedBill = {
        amount,
        currency : currency === '€' ? 'EUR' : currency,
        date : new Date(`${month}/${day}/${year}`),
        filename: await getFileName(date, amount, currency),
        vendor: 'red',
        fileAttributes: {
          metadata: {
            contentAuthor: 'red',
            datetime: new Date(`${month}/${day}/${year}`),
            datetimeLabel: 'issueDate',
            isSubscription: true,
            issueDate: new Date(`${month}/${day}/${year}`),
            carbonCopy: true
          }
        }
      }
      //After the first year of bills, paymentDate is not given anymore
      //So we need to check if the bill has a defined paymentDate
      if(rawPaymentDate !== null){
        const paymentDay = rawPaymentDate[0].match(/[0-9]{2}/g)
        const rawPaymentMonth = rawPaymentDate[0].match(/[a-zûé]{3,4}\.?/g)
        const paymentMonth = computeMonth(rawPaymentMonth[0])
        // Assigning the same year founded for the bill's creation date
        // as it is not provided, assuming the bill has been paid on the same year
        const paymentYear = year
        
        computedBill.paymentDate = new Date(`${paymentMonth}/${paymentDay}/${paymentYear}`)
      }
      if(oneBill.children[4].querySelectorAll('a')[1] !== undefined) {
        const detailedFilepath = oneBill.children[4].querySelectorAll('a')[1].getAttribute('href')
        const detailed = detailedFilepath.match('detail') ? true : false
        const detailedBill = {
          ...computedBill
        }
        detailedBill.filename = await getFileName(date, amount, currency, detailed)
        const fileurl = `${CLIENT_SPACE_URL}${detailedFilepath}`
        const response = await ky.get(fileurl).blob()
        const dataUri = await blobToBase64(response)
        detailedBill.dataUri = dataUri
        oldBills.push(detailedBill)
      }
      const response = await ky.get(fileurl).blob()
      const dataUri = await blobToBase64(response)
      computedBill.dataUri = dataUri
      oldBills.push(computedBill)
      
    }
    console.log('oldBills', oldBills)
    this.log('Old bills fetched')
    return oldBills

  }

  async getReloginPage(){
    if(document.querySelector('#password')){
      return true
    }
    return false
  }
}

const connector = new TemplateContentScript()
connector.init({ additionalExposedMethodsNames: [
  'getUserMail',
  'getMoreBills',
  'getBills',
  'getReloginPage',
  'getIdentity',
] }).catch(err => {
  console.warn(err)
})

function sleep(delay) {
  return new Promise(resolve => {
    setTimeout(resolve, delay * 1000)
  })
}

async function getFileName(date, amount, currency, detailed) {
  return `${date.replace(/\//g,'-')}_red_${amount}${currency}${detailed ? '_detailed' : ''}.pdf`
}

function computeMonth(month) {
  let computedMonth = ''
  switch (month) {
    case 'janv.':
      computedMonth = '01'
      break
    case 'févr.':
      computedMonth = '02'
      break
    case 'mars':
      computedMonth = '03'
      break
    case 'avr.':
      computedMonth = '04'
      break
    case 'mai':
      computedMonth = '05'
      break
    case 'juin':
      computedMonth = '06'
      break
    case 'juil.':
      computedMonth = '07'
      break
    case 'août':
      computedMonth = '08'
      break
    case 'sept.':
      computedMonth = '09'
      break
    case 'oct.':
      computedMonth = '10'
      break
    case 'nov.':
      computedMonth = '11'
      break
    case 'déc.':
      computedMonth = '12'
      break
  }
  return computedMonth
}
