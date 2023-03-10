import { getOnboardingDataFromRequest } from './getOnboardingDataFromRequest'

describe('getOnboardingDataFromRequest', () => {
  it('should correctly parse an URL with a registerToken', () => {
    expect(
      getOnboardingDataFromRequest({
        url: 'https://claude.mycozy.cloud/?registerToken=SOME_TOKEN'
      })
    ).toStrictEqual({
      fqdn: 'claude.mycozy.cloud',
      registerToken: 'SOME_TOKEN'
    })
  })

  it('should return no registerToken if param is not set in URL', () => {
    expect(
      getOnboardingDataFromRequest({
        url: 'https://claude.mycozy.cloud/'
      })
    ).toStrictEqual({
      fqdn: 'claude.mycozy.cloud',
      registerToken: null
    })
  })
})
