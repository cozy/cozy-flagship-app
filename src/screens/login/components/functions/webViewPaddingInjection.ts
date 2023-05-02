import { getDimensions } from '/libs/dimensions'

const dimensions = getDimensions()

export const jsPaddingInjection = `
  window.addEventListener("load", function(event) {
    const body = document.getElementsByTagName('body')[0];
    body.style.paddingTop = '${dimensions.statusBarHeight}px';
    body.style.paddingBottom = '${dimensions.navbarHeight}px';
  });
`

export const cssPadding = `
  body {
    padding-top: ${dimensions.statusBarHeight}px;
    padding-bottom: ${dimensions.navbarHeight}px;
  }
`
