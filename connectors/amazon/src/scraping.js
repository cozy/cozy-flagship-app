import {parse} from 'date-fns'
import {fr} from 'date-fns/locale'
import Minilog from '@cozy/minilog'

const log = Minilog('scraping')
const baseUrl = 'https://www.amazon.fr'

const commandParser = {
  shipmentMessage: {
    sel: '.a-color-success',
  },
  amount: {
    sel: '.order-info .a-fixed-right-grid-inner > .a-col-left > .a-row > div:nth-child(2) .value',
    parse: parseAmount,
  },
  currency: {
    sel: '.order-info .a-fixed-right-grid-inner > .a-col-left > .a-row > div:nth-child(2) .value',
    parse: parseCurrency,
  },
  commandDate: {
    sel: '.order-info .a-fixed-right-grid-inner > .a-col-left > .a-row > div:nth-child(1) .value',
    parse: parseCommandDate,
  },
  vendorRef: {
    sel: "a[href*='order-details'],a[href*='order-summary']",
    attr: 'href',
    parse: (href) => {
      if (!href) {
        return false
      }
      return new URL(baseUrl + href).searchParams.get('orderID')
    },
  },
  detailsUrl: {
    sel: "a[href*='order-details'],a[href*='order-summary']",
    fn: ($) => {
      const json = $.closest('ul')
        .find('[data-a-popover]')
        .attr('data-a-popover')
      try {
        return JSON.parse(json).url
      } catch (err) {
        log.warn(err.message)
        return false
      }
    },
  },
}

export const parseCommands = (resp) => resp.scrape(commandParser, '.order')

function parseAmount(amount) {
  return parseFloat(amount.split(' ').pop().replace(',', '.'))
}

function parseCurrency(amount) {
  return amount.split(' ')[0]
}

function parseCommandDate(date) {
  const result = parse(date, 'd MMMM u', new Date(), {locale: fr})
  return result
}
