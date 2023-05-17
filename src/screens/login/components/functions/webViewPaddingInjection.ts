import { getDimensions } from '/libs/dimensions'

const dimensions = getDimensions()

export const jsPaddingInjection = `
  window.addEventListener("load", function(event) {
    const main = document.getElementsByTagName('main')[0];
    main.style.paddingTop = '${dimensions.statusBarHeight}px';
    main.style.paddingBottom = '${dimensions.navbarHeight}px';
  });
`

export const cssPadding = `
  main {
    padding-top: ${dimensions.statusBarHeight}px !important;
    padding-bottom: ${dimensions.navbarHeight}px !important;
  }
`
