import CozyClient from 'cozy-client'
import { formatOnboardingRedirection } from './formatOnboardingRedirection'

describe('formatOnboardingRedirection', () => {
  const client = {
    getStackClient: (): { uri: string } => ({ uri: 'http://mycozy.test' }),
    getInstanceOptions: (): { capabilities: { flat_subdomains: boolean } } => ({
      capabilities: { flat_subdomains: false }
    })
  } as CozyClient

  it('should format onboarding redirection', () => {
    expect(
      formatOnboardingRedirection('contacts/#/hash', client)
    ).toStrictEqual('http://contacts.mycozy.test/#/hash')
  })

  it('should format onboarding redirection', () => {
    expect(
      formatOnboardingRedirection('contacts/path/#/hash', client)
    ).toStrictEqual('http://contacts.mycozy.test/path/#/hash')
  })
})
