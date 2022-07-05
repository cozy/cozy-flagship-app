import { statusBarHeight, getNavbarHeight } from '/libs/dimensions'

export const addCSS = HTMLstring => {
  const style = `<style>body {--flagship-top-height: ${statusBarHeight}px; --flagship-bottom-height: ${getNavbarHeight()}px;}</style>`

  return HTMLstring.replace('</head>', style + '</head>')
}
