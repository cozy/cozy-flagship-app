import { checkOauthClientsLimit } from '/app/domain/limits/checkOauthClientsLimit'
import { showOauthClientsLimitExceeded } from '/app/domain/limits/OauthClientsLimitService'
import { initHtmlContent } from '/components/webviews/CozyProxyWebView.functions'
import { getCookie } from '/libs/httpserver/httpCookieManager'

jest.mock('/app/domain/limits/checkOauthClientsLimit', () => ({
  checkOauthClientsLimit: jest.fn()
}))
jest.mock('/app/domain/limits/OauthClientsLimitService', () => ({
  showOauthClientsLimitExceeded: jest.fn()
}))
jest.mock('/libs/cozyAppBundle/cozyAppBundle', () => ({
  updateCozyAppBundleInBackground: jest.fn()
}))
jest.mock('/libs/httpserver/httpCookieManager', () => ({
  getCookie: jest.fn()
}))

describe('CozyWebview', () => {
  beforeEach(() => {
    getCookie.mockResolvedValue(undefined)
    checkOauthClientsLimit.mockResolvedValue(false)
  })

  describe('OAuth Client Limit', () => {
    const httpServerContext = {
      getIndexHtmlForSlug: jest.fn().mockResolvedValue({
        source: 'stack',
        html: 'SOME_HTML'
      })
    }
    const href = 'https://claude-home.mycozy.cloud'
    const client = {}
    const dispatch = jest.fn()
    const setHtmlContentCreationDate = jest.fn()

    describe('When rendering a cozy-app', () => {
      it('Should load the WebView if OauthClientLimit is not reached', async () => {
        const slug = 'drive'

        await initHtmlContent({
          httpServerContext,
          slug,
          href,
          client,
          dispatch,
          setHtmlContentCreationDate
        })

        expect(showOauthClientsLimitExceeded).not.toHaveBeenCalled()
        expect(httpServerContext.getIndexHtmlForSlug).toHaveBeenCalled()
        expect(dispatch).toHaveBeenCalled()
      })

      it('Should stop loading WebView and show OauthClientLimitExceeded popup if OauthClientLimit is reached', async () => {
        getCookie.mockResolvedValue({ name: 'SOME_COOKIE' })
        checkOauthClientsLimit.mockResolvedValue(true)

        const slug = 'drive'

        await initHtmlContent({
          httpServerContext,
          slug,
          href,
          client,
          dispatch,
          setHtmlContentCreationDate
        })

        expect(checkOauthClientsLimit).toHaveBeenCalledTimes(1)
        expect(showOauthClientsLimitExceeded).toHaveBeenCalled()
        expect(httpServerContext.getIndexHtmlForSlug).not.toHaveBeenCalled()
        expect(dispatch).not.toHaveBeenCalled()
      })
    })

    describe('When rendering cozy-home', () => {
      it('Should load the WebView if OauthClientLimit is not reached', async () => {
        const slug = 'home'

        await initHtmlContent({
          httpServerContext,
          slug,
          href,
          client,
          dispatch,
          setHtmlContentCreationDate
        })

        expect(showOauthClientsLimitExceeded).not.toHaveBeenCalled()
        expect(httpServerContext.getIndexHtmlForSlug).toHaveBeenCalled()
        expect(dispatch).toHaveBeenCalled()
      })

      it('Should load the WebView but show OauthClientLimitExceeded popup if OauthClientLimit is reached', async () => {
        getCookie.mockResolvedValue({ name: 'SOME_COOKIE' })
        checkOauthClientsLimit.mockResolvedValue(true)

        const slug = 'home'

        await initHtmlContent({
          httpServerContext,
          slug,
          href,
          client,
          dispatch,
          setHtmlContentCreationDate
        })

        expect(showOauthClientsLimitExceeded).toHaveBeenCalledWith(
          'https://claude-home.mycozy.cloud'
        )
        expect(httpServerContext.getIndexHtmlForSlug).toHaveBeenCalled()
        expect(dispatch).toHaveBeenCalled()
      })
    })

    describe('When rendering cozy-settings', () => {
      it('Should load the WebView if OauthClientLimit is not reached', async () => {
        const slug = 'settings'

        await initHtmlContent({
          httpServerContext,
          slug,
          href,
          client,
          dispatch,
          setHtmlContentCreationDate
        })

        expect(showOauthClientsLimitExceeded).not.toHaveBeenCalled()
        expect(httpServerContext.getIndexHtmlForSlug).toHaveBeenCalled()
        expect(dispatch).toHaveBeenCalled()
      })

      it('Should load the WebView without showing OauthClientLimitExceeded popup if OauthClientLimit is reached', async () => {
        getCookie.mockResolvedValue({ name: 'SOME_COOKIE' })
        checkOauthClientsLimit.mockResolvedValue(true)

        const slug = 'settings'

        await initHtmlContent({
          httpServerContext,
          slug,
          href,
          client,
          dispatch,
          setHtmlContentCreationDate
        })

        expect(showOauthClientsLimitExceeded).not.toHaveBeenCalledWith()
        expect(httpServerContext.getIndexHtmlForSlug).toHaveBeenCalled()
        expect(dispatch).toHaveBeenCalled()
      })
    })

    describe('Should handle Cookie race-condition', () => {
      it('Should call checkOauthClientsLimit once if Cookie is set', async () => {
        getCookie.mockResolvedValue({ name: 'SOME_COOKIE' })
        checkOauthClientsLimit.mockResolvedValue(false)

        const slug = 'home'

        await initHtmlContent({
          httpServerContext,
          slug,
          href,
          client,
          dispatch,
          setHtmlContentCreationDate
        })

        expect(checkOauthClientsLimit).toHaveBeenCalledTimes(1)
        expect(httpServerContext.getIndexHtmlForSlug).toHaveBeenCalled()
        expect(dispatch).toHaveBeenCalled()
      })

      it('Should call checkOauthClientsLimit once if no Cookie is set', async () => {
        getCookie.mockResolvedValue(undefined)
        checkOauthClientsLimit.mockResolvedValue(false)

        const slug = 'home'

        await initHtmlContent({
          httpServerContext,
          slug,
          href,
          client,
          dispatch,
          setHtmlContentCreationDate
        })

        expect(checkOauthClientsLimit).toHaveBeenCalledTimes(1)
        expect(httpServerContext.getIndexHtmlForSlug).toHaveBeenCalled()
        expect(dispatch).toHaveBeenCalled()
      })

      it('Should stop loading WebView before calling getIndexHtmlForSlug if Cookie is set and OauthClientLimit is reached', async () => {
        getCookie.mockResolvedValue({ name: 'SOME_COOKIE' })
        checkOauthClientsLimit.mockResolvedValue(true)

        const slug = 'drive'

        await initHtmlContent({
          httpServerContext,
          slug,
          href,
          client,
          dispatch,
          setHtmlContentCreationDate
        })

        expect(checkOauthClientsLimit).toHaveBeenCalledTimes(1)
        expect(showOauthClientsLimitExceeded).toHaveBeenCalled()
        expect(httpServerContext.getIndexHtmlForSlug).not.toHaveBeenCalled()
        expect(dispatch).not.toHaveBeenCalled()
      })

      it('Should stop loading WebView after calling getIndexHtmlForSlug if no Cookie is set and OauthClientLimit is reached', async () => {
        getCookie.mockResolvedValue(undefined)
        checkOauthClientsLimit.mockResolvedValue(true)

        const slug = 'drive'

        await initHtmlContent({
          httpServerContext,
          slug,
          href,
          client,
          dispatch,
          setHtmlContentCreationDate
        })

        expect(checkOauthClientsLimit).toHaveBeenCalledTimes(1)
        expect(showOauthClientsLimitExceeded).toHaveBeenCalled()
        expect(httpServerContext.getIndexHtmlForSlug).toHaveBeenCalled()
        expect(dispatch).not.toHaveBeenCalled()
      })
    })
  })
})
