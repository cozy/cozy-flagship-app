/***************************************************************/
/* This code should reflect cozy-stack/assets/fonts/fonts.css  */
/***************************************************************/

export const fontsCss = instance => `
@font-face {
  font-family: Lato;
  font-style: normal;
  font-weight: normal;
  src: url("${instance}/assets/fonts/Lato-Regular.immutable.woff2") format("woff2");
  font-display: fallback;
}
@font-face {
  font-family: Lato;
  font-style: normal;
  font-weight: bold;
  src: url("${instance}/assets/fonts/Lato-Bold.immutable.woff2") format("woff2");
  font-display: fallback;
}
`
