import {Platform} from 'react-native'
import {Dimensions, StatusBar} from 'react-native'

const screenHeight = Dimensions.get('screen').height
const windowHeight = Dimensions.get('window').height
const navbarHeight = screenHeight - windowHeight
const statusBarHeight = StatusBar.currentHeight

export const jsCSSclassInjection = routeName => `
  window.addEventListener('load', (event) => {
    window.document.body.classList.add('flagship-app', 'flagship-os-${Platform.OS}', 'flagship-route-${routeName}');
    window.document.body.style.setProperty('--flagship-top-height', '${statusBarHeight}px');
    window.document.body.style.setProperty('--flagship-bottom-height', '${navbarHeight}px');
  });
`
