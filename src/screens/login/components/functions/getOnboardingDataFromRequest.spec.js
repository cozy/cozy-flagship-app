import { getOnboardingDataFromRequest } from './getOnboardingDataFromRequest'

describe('getOnboardingDataFromRequest', () => {
  it(`should correctly parse an URL with a 'onboarding=true'`, () => {
    expect(
      getOnboardingDataFromRequest({
        url: 'https://claude.mycozy.cloud/?onboarding=true&redirection=mespapiers&registerToken=SOME_TOKEN'
      })
    ).toStrictEqual({
      fqdn: 'claude.mycozy.cloud',
      magicCode: null,
      onboardedRedirection: 'mespapiers',
      registerToken: 'SOME_TOKEN'
    })
  })

  it(`should return null if URL has no 'onboarding=true' param`, () => {
    expect(
      getOnboardingDataFromRequest({
        url: 'http://claude.mycozy.cloud/?redirection=mespapiers&registerToken=SOME_REGISTER_TOKEN'
      })
    ).toBeNull()
  })

  it(`should correctly parse an URL with a magic_code (instance created from magic link email)`, () => {
    expect(
      getOnboardingDataFromRequest({
        url: 'https://claude.mycozy.cloud/?onboarding=true&redirection=mespapiers&magic_code=SOME_MAGIC_CODE'
      })
    ).toStrictEqual({
      fqdn: 'claude.mycozy.cloud',
      magicCode: 'SOME_MAGIC_CODE',
      onboardedRedirection: 'mespapiers',
      registerToken: null
    })
  })
})
