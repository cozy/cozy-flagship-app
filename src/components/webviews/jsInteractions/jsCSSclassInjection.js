import {Platform} from 'react-native'

export const jsCSSclassInjection = routeName => `
  window.addEventListener('load', (event) => {
    window.document.body.classList.add('flagship-app', 'flagship-os-${Platform.OS}', 'flagship-route-${routeName}');
  });
`
