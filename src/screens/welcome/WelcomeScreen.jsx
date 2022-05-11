import React from 'react'
import WebView from 'react-native-webview'

import { WelcomePage as html } from '/components/html/WelcomePage'
import { routes } from '/constants/routes'
import { makeHandlers } from '/libs/functions/makeHandlers'
import { navigate } from '/libs/RootNavigation'

export const WelcomeScreen = () => (
  <WebView
    onMessage={makeHandlers({
      onContinue: () => navigate(routes.authenticate)
    })}
    source={{ html }}
  />
)
