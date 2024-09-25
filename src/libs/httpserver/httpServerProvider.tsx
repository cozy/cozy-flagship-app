import flow from 'lodash/fp/flow'
import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useState
} from 'react'
import Config from 'react-native-config'

import type CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'

import { isOfflineCompatible } from '/app/domain/offline/isOfflineCompatible'
import { getErrorMessage } from '/libs/functions/getErrorMessage'
import HttpServer from '/libs/httpserver/HttpServer'
import { fetchAppDataForSlug } from '/libs/httpserver/indexDataFetcher'
import { getServerBaseFolder } from '/libs/httpserver/httpPaths'
import { queryResultToCrypto } from '/components/webviews/CryptoWebView/cryptoObservable/cryptoObservable'
import { setCookie } from '/libs/httpserver/httpCookieManager'
import { HtmlSource } from '/libs/httpserver/models'

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

const DEFAULT_PORT = Config.HTTP_SERVER_DEFAULT_PORT
  ? Number(Config.HTTP_SERVER_DEFAULT_PORT)
  : 5759

interface IndexHtmlForSlug {
  source: HtmlSource
  html: string | false
}

interface HttpServerState {
  server: HttpServer | undefined
  securityKey: string
  isRunning: () => Promise<boolean>
  stop: () => void
  getIndexHtmlForSlug: (
    slug: string,
    client: CozyClient
  ) => Promise<IndexHtmlForSlug | false>
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

  const stop = (): void => serverInstance?.stop()

  const getIndexHtmlForSlug = async (
    slug: string,
    client: CozyClient
  ): Promise<IndexHtmlForSlug> => {
    try {
      if (!serverInstance) {
        throw new Error('ServerInstance is null, should not happen')
      }

      const rootURL = client.getStackClient().uri

      const { host: fqdn } = new URL(rootURL)

      const { cookie, source, templateValues } = await fetchAppDataForSlug(
        slug,
        client
      )

      if (source === 'cache') {
        log.debug(
          'App from cache detected, cheking if the app is compatible with offline mode'
        )
        const isOffflineCompatitble = await isOfflineCompatible(fqdn, slug)

        if (!isOffflineCompatitble) {
          log.debug(
            `App ${slug}' is NOT compatible with offline, abort index generation`
          )
          return {
            html: false,
            source: 'offline'
          }
        }
        log.debug(
          `App ${slug}' is compatible with offline, continue index generation`
        )
      }

      await setCookie(cookie, client)
      const rawHtml = await getIndexForFqdnAndSlug(fqdn, slug, source)

      if (!rawHtml) {
        return {
          html: false,
          source: 'none'
        }
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
        const html = flow(
          addColorSchemeMetaIfNecessary,
          addBarStyles,
          addBodyClasses,
          addMetaAttributes
        )(computedHtml)

        return {
          source,
          html
        }
      } else {
        // We do not need the bar styles for other app. We only need it for
        // the Home application since this is the only "immersive app"
        const html = flow(
          addColorSchemeMetaIfNecessary,
          addBodyClasses,
          addMetaAttributes
        )(computedHtml)

        return {
          source,
          html
        }
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      log.error(
        `Error while generating Index.html for ${slug}. Cozy-stack version will be used instead. Error was: ${errorMessage}`
      )

      return {
        html: false,
        source: 'offline'
      }
    }
  }

  return (
    <HttpServerContext.Provider
      value={{
        server: serverInstance,
        securityKey: serverSecurityKey,
        isRunning,
        stop,
        getIndexHtmlForSlug
      }}
      {...props}
    />
  )
}
