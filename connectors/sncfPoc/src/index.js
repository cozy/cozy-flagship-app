/* eslint-disable no-console */

import {postMessage, log, kyScraper, blobToBase64} from './libs'

async function start() {
  monkeyPatch()
  log('info', 'Testing login')
  const isLogin = await testLogin()
   if (!isLogin) {
    log('info', 'LOGIN_FAILED')
    return
  } else {
    log('info', 'LOGIN_OK')
  }


  log('info', 'Fetching Identity')
  const identity = await kyScraper.get(`https://www.oui.sncf/api/gtw/v2/clients/customers/me?timestamp=${Date.now()}`).json()
  log('info', 'identity', identity.ouiAccount.contact)

  log('info', 'Fetching commands...')
  const commands = await fetchCommands()
  log('info', 'commands', commands)

  postMessage({ message: 'saveFiles', value: commands, options: {
    sourceAccountIdentifier: identity.ouiAccount.contact.email
  } })
}

// this will intercept window.open called by sncf login and instead display it in the current
// webview
function monkeyPatch() {
  log('info', 'monkeyPatch')
  window.open = function(url) {
    document.location = url
  }
}

async function fetchCommands() {
  const resp = await kyScraper
    .get(
      'https://www.oui.sncf/espaceclient/ordersconsultation/showOrdersForAjaxRequest?pastOrder=true&cancelledOrder=false&pageToLoad=1&_=' +
        Date.now()
    )

  const orders = await resp.scrape({
    billUrl: {
      sel: `.show-for-small-only a[title='Justificatif']`,
      attr: 'href',
      parse: href => href.replace(':80')
    },
    reference: `.order__detail [data-auto=ccl_orders_travel_number]`,
    label: {
      sel: '.order__top .texte--insecable',
      fn: (el) => Array.from(el)
                    .map(e => e.children
                      .filter(n => n.type === 'text')
                      .map(n => n.data.trim())
                    ).join('-').replace(',', '')
    },
    date: {
      sel: '.order__detail div:nth-child(2) .texte--important',
      parse: date => new Date(date.split('/').reverse().join('-'))
    },
    amount: {
      sel: '.order__detail div:nth-child(3) .texte--important',
      parse: amount => parseFloat(amount.replace(' €', ''))
    }
  }, '.order')

  let result = []
  // TODO should send files one by one to avoid to keep all the blobs in memory
  for (const order of orders) {
    const blob = await kyScraper.get(order.billUrl).blob()
    result.push({
      dataUri: await blobToBase64(blob),
      fileName: `${order.date.toISOString().split('T').shift()}_${order.label}_${order.amount}€.pdf`
    })
  }

  return result
}

async function testLogin() {
  const {redirected} = await kyScraper.get(
    'https://www.oui.sncf/espaceclient/commandes-en-cours'
  )

  return !redirected
}

start().catch((err) => console.error(err))
