import { Platform } from 'react-native'

import { statusBarHeight, getNavbarHeight } from '/libs/dimensions'
import { navigationRef } from '/libs/RootNavigation'

export const addCSS = HTMLstring => {
  const style = `<style>body {--flagship-top-height: ${statusBarHeight}px; --flagship-bottom-height: ${getNavbarHeight()}px;}</style>`

  return HTMLstring.replace('</head>', style + '</head>')
}

export const addBodyClasses = HTMLstring => {
  const bodyClasses = `class="flagship-app flagship-os-${
    Platform.OS
  } flagship-route-${navigationRef.getCurrentRoute().name}"`

  return HTMLstring.replace('<body', `<body ${bodyClasses}`)
}

export const addMetaAttributes = HTMLstring => {
  const metaAttributes = `<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />`

  return HTMLstring.replace('</head>', metaAttributes + '</head>')
}
