import Minilog from '@cozy/minilog'
import React, { useEffect, useRef } from 'react'

import { CozyProxyWebView } from '/components/webviews/CozyProxyWebView'
import { CozyWebView } from '/components/webviews/CozyWebView'
import ReloadInterceptorWebView from '/components/webviews/ReloadInterceptorWebView'
import { SupervisedWebView } from '/components/webviews/SupervisedWebView'

const log = Minilog('🌍 ComposedWebView')

const ComposedWebViewItem = React.forwardRef(
  ({ ItemType, childrenTypes, currentLevel, ...otherProps }, ref) => {
    const [firstChild, ...otherChildren] = childrenTypes

    console.log('1️⃣ currentLevel', currentLevel)
    const ChildWebview = React.forwardRef((subOtherProps, subRef) => {

      useEffect(() => {
        log.debug('ComposedWebView mount')

        return () => {
          log.debug('ComposedWebView unmount')
        }
      }, [])

      return (
        <ComposedWebViewItem
          ItemType={firstChild}
          childrenTypes={otherChildren}
          currentLevel={currentLevel + 1}
          ref={subRef}
          {...subOtherProps}
        />
      )
    })
    ChildWebview.displayName = 'ChildWebviewRef'

    return (
      <>
        {childrenTypes?.length > 0 ? (
          <ItemType ChildWebview={ChildWebview} ref={ref} {...otherProps} />
        ) : (
          <ItemType ref={ref} {...otherProps} />
        )}
      </>
    )
  }
)
ComposedWebViewItem.displayName = 'ComposedWebViewItem'

export const ComposedWebView = ({ childrenTypes, ...otherProps }) => {
  const [ChildWebview, ...otherChildren] = childrenTypes
  const ref = useRef(null)

  return (
    <ComposedWebViewItem
      ItemType={ChildWebview}
      childrenTypes={otherChildren}
      currentLevel={0}
      ref={ref}
      {...otherProps}
    />
  )
}

export const CozyAppWebView = props => {
  return (
    <ComposedWebView
      {...props}
      childrenTypes={[
        CozyProxyWebView,
        CozyWebView,
        // ReloadInterceptorWebView,
        SupervisedWebView
      ]}
    />
  )
}
