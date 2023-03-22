import CozyClient from 'cozy-client'

import { formatRedirectLink } from '/libs/functions/formatRedirectLink'

describe('formatRedirectLink', () => {
  const client = {
    getStackClient: (): { uri: string } => ({ uri: 'http://mycozy.test' }),
    getInstanceOptions: (): { capabilities: { flat_subdomains: boolean } } => ({
      capabilities: { flat_subdomains: false }
    })
  } as CozyClient

  it('should format redirect link with hash', () => {
    expect(formatRedirectLink('contacts/#/hash', client)).toStrictEqual(
      'http://contacts.mycozy.test/#/hash'
    )
  })

  it('should format redirect link with path and hash', () => {
    expect(formatRedirectLink('contacts/path/#/hash', client)).toStrictEqual(
      'http://contacts.mycozy.test/path/#/hash'
    )
  })

  it('should return null when redirect link is invalid', () => {
    expect(formatRedirectLink('http://home.mycozy.test', client)).toBe(null)
  })
})
