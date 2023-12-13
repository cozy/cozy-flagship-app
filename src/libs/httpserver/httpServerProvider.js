import flow from 'lodash/fp/flow'
import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useState
} from 'react'
import Minilog from 'cozy-minilog'

import HttpServer from '/libs/httpserver/HttpServer'
import { fetchAppDataForSlug } from '/libs/httpserver/indexDataFetcher'
import { getServerBaseFolder } from '/libs/httpserver/httpPaths'
import { queryResultToCrypto } from '/components/webviews/CryptoWebView/cryptoObservable/cryptoObservable'
import { setCookie } from '/libs/httpserver/httpCookieManager'

import {
  addBodyClasses,
  addMetaAttributes,
  addBarStyles,
  addColorSchemeMetaIfNecessary
} from './server-helpers'

import {
  fillIndexWithData,
  getIndexForFqdnAndSlug
} from '/libs/httpserver/indexGenerator'

const log = Minilog('HttpServerProvider')

const DEFAULT_PORT = 5757

export const HttpServerContext = createContext(undefined)

export const useHttpServerContext = () => {
  const httpServerContext = useContext(HttpServerContext)

  return httpServerContext
}

export const HttpServerProvider = props => {
  const [serverSecurityKey, setServerSecurityKey] = useState('')

  const port = DEFAULT_PORT
  const path = getServerBaseFolder()

  const [serverInstance, setServerInstance] = useState(undefined)

  useLayoutEffect(() => {
    const server = new HttpServer(port, path, {
      localOnly: true,
      keepAlive: true
    })

    const startingHttpServer = async () => {
      log.debug('🚀 Starting server')
      return server.start()
    }

    startingHttpServer()
      .then(async url => {
        log.debug('🚀 Serving at URL', url)

        const { securityKey } = await queryResultToCrypto(
          'generateHttpServerSecurityKey'
        )

        server.setSecurityKey(securityKey)
        setServerSecurityKey(securityKey)

        setServerInstance(server)
        return
      })
      .catch(error => log.error(error))

    return () => {
      log.debug('❌ stopping server')
      server.stop()
      setServerInstance(undefined)
    }
  }, [path, port])

  const isRunning = async () =>
    (await serverInstance?.isRunning()) ?? false

  const getIndexHtmlForSlug = async (slug, client) => {
    try {
      const rootURL = client.getStackClient().uri

      const { host: fqdn } = new URL(rootURL)

      const { cookie, templateValues } = await fetchAppDataForSlug(slug, client)

      await setCookie(cookie, client)
      const rawHtml = await getIndexForFqdnAndSlug(fqdn, slug)

      if (!rawHtml) {
        return false
      }

      const computedHtml = await fillIndexWithData({
        fqdn,
        slug,
        port: serverInstance.port,
        securityKey: serverSecurityKey,
        indexContent: rawHtml,
        indexData: templateValues
      })
      if (slug === 'home') {
        return flow(
          addColorSchemeMetaIfNecessary,
          addBarStyles,
          addBodyClasses,
          addMetaAttributes
        )(computedHtml)
      } else {
        // We do not need the bar styles for other app. We only need it for
        // the Home application since this is the only "immersive app"
        return flow(
          addColorSchemeMetaIfNecessary,
          addBodyClasses,
          addMetaAttributes
        )(computedHtml)
      }
    } catch (err) {
      log.error(
        `Error while generating Index.html for ${slug}. Cozy-stack version will be used instead. Error was: ${err.message}`
      )

      return false
    }
  }

  return (
    <HttpServerContext.Provider
      value={{
        server: serverInstance,
        securityKey: serverSecurityKey,
        isRunning,
        getIndexHtmlForSlug
      }}
      {...props}
    />
  )
}
