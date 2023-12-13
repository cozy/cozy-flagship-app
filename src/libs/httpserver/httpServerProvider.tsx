import flow from 'lodash/fp/flow'
import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useState
} from 'react'

import type CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'

import { getErrorMessage } from '/libs/functions/getErrorMessage'
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

interface HttpServerState {
  server: HttpServer | undefined
  securityKey: string
  isRunning: () => Promise<boolean>
  getIndexHtmlForSlug: (
    slug: string,
    client: CozyClient
  ) => Promise<string | false>
}

interface SecurityKeyResult {
  securityKey: string
}

export const HttpServerContext = createContext<HttpServerState | undefined>(
  undefined
)

export const useHttpServerContext = (): HttpServerState | undefined => {
  const httpServerContext = useContext(HttpServerContext)

  return httpServerContext
}

interface HttpServerProviderProps {
  children: React.ReactNode
}

export const HttpServerProvider = (
  props: HttpServerProviderProps
): JSX.Element => {
  const [serverSecurityKey, setServerSecurityKey] = useState('')

  const port = DEFAULT_PORT
  const path = getServerBaseFolder()

  const [serverInstance, setServerInstance] = useState<HttpServer | undefined>(
    undefined
  )

  useLayoutEffect(() => {
    const server = new HttpServer(port, path, {
      localOnly: true,
      keepAlive: true
    })

    const startingHttpServer = (): Promise<unknown> => {
      log.debug('🚀 Starting server')
      return server.start()
    }

    startingHttpServer()
      .then(async url => {
        log.debug('🚀 Serving at URL', url)

        const { securityKey } = (await queryResultToCrypto(
          'generateHttpServerSecurityKey'
        )) as unknown as SecurityKeyResult

        await server.setSecurityKey(securityKey)
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

  const isRunning = async (): Promise<boolean> =>
    (await serverInstance?.isRunning()) ?? false

  const getIndexHtmlForSlug = async (
    slug: string,
    client: CozyClient
  ): Promise<string | false> => {
    try {
      if (!serverInstance) {
        throw new Error('ServerInstance is null, should not happen')
      }

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
      const errorMessage = getErrorMessage(err)
      log.error(
        `Error while generating Index.html for ${slug}. Cozy-stack version will be used instead. Error was: ${errorMessage}`
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
