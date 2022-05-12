import React from 'react'
import WebView from 'react-native-webview'

import { WelcomePage } from '/components/html/WelcomePage'
import { makeHTML } from '/components/makeHTML'
import { routes } from '/constants/routes'
import { makeHandlers } from '/libs/functions/makeHandlers'
import { navigate } from '/libs/RootNavigation'

export const WelcomeScreen = () => (
  <WebView
    onMessage={makeHandlers({
      onContinue: () => navigate(routes.authenticate)
    })}
    source={{ html: makeHTML(WelcomePage) }}
  />
)
