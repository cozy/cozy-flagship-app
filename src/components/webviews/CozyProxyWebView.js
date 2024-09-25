import { useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useState, useEffect } from 'react'
import { AppState, KeyboardAvoidingView, Platform, View } from 'react-native'

import { useClient } from 'cozy-client'
import Minilog from 'cozy-minilog'

import { RemountProgress } from '/app/view/Loading/RemountProgress'
import { initHtmlContent } from '/components/webviews/CozyProxyWebView.functions'
import { CozyWebView } from '/components/webviews/CozyWebView'
import { useHttpServerContext } from '/libs/httpserver/httpServerProvider'

import { styles } from '/components/webviews/CozyProxyWebView.styles'

const log = Minilog('CozyProxyWebView')

const HTML_CONTENT_EXPIRATION_DELAY_IN_MS = 23 * 60 * 60 * 1000

export const CozyProxyWebView = ({
  slug,
  href,
  onLoad = undefined,
  wrapperStyle,
  ...props
}) => {
  const client = useClient()
  const httpServerContext = useHttpServerContext()
  const [state, dispatch] = useState({
    source: undefined,
    html: undefined,
    nativeConfig: undefined,
    isLoading: false
  })
  const [htmlContentCreationDate, setHtmlContentCreationDate] = useState(
    Date.now()
  )

  const reload = useCallback(() => {
    log.debug('Reloading CozyProxyWebView')
    dispatch({
      source: undefined,
      isLoading: true
    })
    initHtmlContent({
      httpServerContext,
      slug,
      href,
      client,
      dispatch,
      setHtmlContentCreationDate
    })
  }, [client, href, httpServerContext, slug])

  const reloadIfTooOld = useCallback(() => {
    if (
      Date.now() - htmlContentCreationDate >
      HTML_CONTENT_EXPIRATION_DELAY_IN_MS
    ) {
      log.debug(
        'CozyProxyWebView is too old and should be reloaded to refresh tokens'
      )
      reload()
    }
  }, [htmlContentCreationDate, reload])

  useEffect(() => {
    const init = async () => {
      if (await httpServerContext.isRunning()) {
        if (slug) {
          initHtmlContent({
            httpServerContext,
            slug,
            href,
            client,
            dispatch,
            setHtmlContentCreationDate
          })
        } else {
          dispatch({
            html: undefined,
            nativeConfig: undefined,
            source: { uri: href }
          })
        }
      }
    }

    void init()
  }, [client, httpServerContext, slug, href])

  useFocusEffect(
    useCallback(() => {
      reloadIfTooOld()
    }, [reloadIfTooOld])
  )

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        reloadIfTooOld()
      }
    })
    return () => {
      subscription?.remove()
    }
  })

  const Wrapper = Platform.OS === 'ios' ? View : KeyboardAvoidingView

  return (
    <Wrapper
      style={{ ...styles.view, ...wrapperStyle }}
      behavior="height"
      keyboardVerticalOffset={props.keyboardVerticalOffset || 0}
    >
      {state.source ? (
        <CozyWebView
          slug={slug}
          source={state.source}
          nativeConfig={state.nativeConfig}
          injectedIndex={state.html}
          reloadProxyWebView={reload}
          onLoad={syntheticEvent => {
            dispatch(oldState => ({ ...oldState, isLoading: false }))
            onLoad?.(syntheticEvent)
          }}
          cacheMode={
            state.activateCache ? 'LOAD_CACHE_ELSE_NETWORK' : 'LOAD_DEFAULT'
          }
          {...props}
        />
      ) : null}
      {state.isLoading && <RemountProgress />}
    </Wrapper>
  )
}
