import { Platform } from 'react-native'

import { getDimensions } from '/libs/dimensions'
import { navigationRef } from '/libs/RootNavigation'

export const addBarStyles = (HTMLstring: string): string => {
  console.log('💜 getDimensions() from addBarStyles')
  const { navbarHeight, statusBarHeight } = getDimensions()

  const style = `<style>body {--flagship-top-height: ${statusBarHeight}px; --flagship-bottom-height: ${navbarHeight}px;}</style>`

  return HTMLstring.replace('</head>', style + '</head>')
}

export const addBodyClasses = (HTMLstring: string): string => {
  const bodyClasses = `flagship-app flagship-os-${Platform.OS} flagship-route-${
    navigationRef.getCurrentRoute()?.name ?? 'unknown'
  }`

  const hasClasses = /<body.*?class=("|')(.*?)("|')/i.exec(HTMLstring)

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- not sure why a RegExpExecArray value can be undefined
  if (!hasClasses || hasClasses[2] === undefined)
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

export const addColorSchemeMetaIfNecessary = (HTMLstring: string): string => {
  const metaColorScheme = `<meta name="color-scheme" content="light only"/>`

  // Check if color-scheme meta tag is already present
  const colorSchemeRegex = /<meta[^>]*name=['"]?color-scheme['"]?[^>]*>/i
  const colorSchemeExists = colorSchemeRegex.test(HTMLstring)

  // Add the meta tag before the closing </head> tag if not present
  if (!colorSchemeExists) {
    return HTMLstring.replace('</head>', `${metaColorScheme}</head>`)
  }

  return HTMLstring
}
