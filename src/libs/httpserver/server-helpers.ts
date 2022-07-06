import { Platform } from 'react-native'

import { statusBarHeight, getNavbarHeight } from '/libs/dimensions'
import { navigationRef } from '/libs/RootNavigation'

export const addBarStyles = (HTMLstring: string): string => {
  const style = `<style>body {--flagship-top-height: ${statusBarHeight}px; --flagship-bottom-height: ${getNavbarHeight()}px;}</style>`

  return HTMLstring.replace('</head>', style + '</head>')
}

export const addBodyClasses = (HTMLstring: string): string => {
  const bodyClasses = `flagship-app flagship-os-${Platform.OS} flagship-route-${
    navigationRef.getCurrentRoute()?.name ?? 'unknown'
  }`

  const hasClasses = /<body.*?class=("|')(.*?)("|')/i.exec(HTMLstring)

  if (!hasClasses)
    return HTMLstring.replace('<body', `<body class="${bodyClasses}"`)

  const tagIndex = HTMLstring.indexOf('"', HTMLstring.indexOf(hasClasses[2]))

  return `${HTMLstring.slice(
    0,
    tagIndex
  )}${' '}${bodyClasses}"${HTMLstring.slice(tagIndex + 1)}`
}

export const addMetaAttributes = (HTMLstring: string): string => {
  const metaAttributes = `<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />`

  return HTMLstring.replace('</head>', metaAttributes + '</head>')
}
