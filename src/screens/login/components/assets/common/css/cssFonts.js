/****************************************************************/
/* This code should reflect cozy-stack/assets/fonts/fonts.css  */
/****************************************************************/

export const fontsCss = instance => {
  const regularLatoUrl = new URL(instance)
  regularLatoUrl.pathname = 'assets/fonts/Lato-Regular.immutable.woff2'
  const regularLatoUrlString = regularLatoUrl.toString()

  const boldLatoUrl = new URL(instance)
  boldLatoUrl.pathname = 'assets/fonts/Lato-Bold.immutable.woff2'
  const boldLatoUrlString = boldLatoUrl.toString()

  const interUrl = new URL(instance)
  interUrl.pathname = 'assets/fonts/Inter-VariableFont_opsz,wght.ttf'
  const interUrlString = interUrl.toString()

  return `
@font-face {
  font-family: Lato;
  font-style: normal;
  font-weight: normal;
  src: url("${regularLatoUrlString}") format("woff2");
  font-display: fallback;
}
@font-face {
  font-family: Lato;
  font-style: normal;
  font-weight: bold;
  src: url("${boldLatoUrlString}") format("woff2");
  font-display: fallback;
}

@font-face {
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  src: url("${interUrlString}");
  font-display: fallback;
}
`
}
