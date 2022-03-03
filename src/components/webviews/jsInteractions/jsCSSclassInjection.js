import {Platform} from 'react-native'
import {statusBarHeight, navbarHeight} from '../../../libs/dimensions'

export const jsCSSclassInjection = routeName => `
  window.addEventListener('load', (event) => {
    window.document.body.classList.add('flagship-app', 'flagship-os-${Platform.OS}', 'flagship-route-${routeName}');
    window.document.body.style.setProperty('--flagship-top-height', '${statusBarHeight}px');
    window.document.body.style.setProperty('--flagship-bottom-height', '${navbarHeight}px');
  });
`
