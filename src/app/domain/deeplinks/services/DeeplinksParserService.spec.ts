import {
  parseFallbackURL,
  parseOnboardLink
} from '/app/domain/deeplinks/services/DeeplinksParserService'
import { routes } from '/constants/routes'

describe('DeeplinksParserService', () => {
  describe('parseOnboardLink', () => {
    it('should handle InstanceCreation deeplinks', () => {
      const deeplink =
        'https://links.mycozy.cloud/flagship/onboarding?flagship=true&onboard_url=SOME_ONBOARD_URL'

      const result = parseOnboardLink(deeplink)

      expect(result).toStrictEqual({
        route: routes.instanceCreation,
        params: {
          onboardUrl: 'SOME_ONBOARD_URL'
        },
        onboardedRedirection: null
      })
    })

    it('should handle Login deeplinks', () => {
      const deeplink = 'http://localhost:8080/onboarding-url?fqdn=SOME_FQDN'

      const result = parseOnboardLink(deeplink)

      expect(result).toStrictEqual({
        route: routes.authenticate,
        params: {
          emailVerifiedCode: null,
          fqdn: 'SOME_FQDN'
        },
        onboardedRedirection: null
      })
    })

    it('should handle MagicLink deeplinks', () => {
      const deeplink =
        'https://links.mycozy.cloud/flagship/onboarding?flagship=true&fqdn=SOME_FQDN&magic_code=SOME_MAGIC_CODE'

      const result = parseOnboardLink(deeplink)

      expect(result).toStrictEqual({
        route: routes.authenticate,
        params: {
          fqdn: 'SOME_FQDN',
          magicCode: 'SOME_MAGIC_CODE'
        }
      })
    })

    it('should return null if no deeplink detected', () => {
      const deeplink = 'https://SOME_UNHANDLED_DEEPLINK'

      const result = parseOnboardLink(deeplink)

      expect(result).toBeNull()
    })

    it('should handle Manager deeplinks', () => {
      const deeplink =
        'https://links.mycozy.cloud/flagship/manager?fallback=SOME_FALLBACK'

      const result = parseOnboardLink(deeplink)

      expect(result).toStrictEqual({
        route: routes.manager,
        params: {
          managerUrl: 'SOME_FALLBACK'
        }
      })
    })
  })

  describe('parseFallbackURL', () => {
    it('should not intercept cozy:// links as cozyAppFallbackURL', () => {
      const deeplink =
        'https://links.mycozy.cloud/flagship/onboarding?flagship=true&fallback=cozy%3A%2F%2Fonboarding%3Fflagship%3Dtrue%26fqdn%3Dclaude.mycozy.cloud&fqdn=claude.mycozy.cloud'

      const { mainAppFallbackURL, cozyAppFallbackURL } =
        parseFallbackURL(deeplink)

      expect(mainAppFallbackURL).toBeUndefined()
      expect(cozyAppFallbackURL).toBeUndefined()
    })
    it('should not intercept manager.cozycloud.cc links as cozyAppFallbackURL', () => {
      const deeplink =
        'https://links.mycozy.cloud/flagship/manager?fallback=https%3A%2F%2Fmanager.cozycloud.cc%2Fv2%2Fcozy%2Fstart%2FSOME_ID%3Fredirect%3Dhttps%253A%252F%252Flinks.mycozy.cloud%252Fflagship%252Fonboarding%253Fflagship%253Dtrue%2526fallback%253Dcozy%25253A%25252F%25252Fonboarding%25253Fflagship%25253Dtrue'

      const { mainAppFallbackURL, cozyAppFallbackURL } =
        parseFallbackURL(deeplink)

      expect(mainAppFallbackURL).toBeUndefined()
      expect(cozyAppFallbackURL).toBeUndefined()
    })
  })
})
