import {Dimensions, StatusBar} from 'react-native'

const screenHeight = Dimensions.get('screen').height
const windowHeight = Dimensions.get('window').height
const navbarHeight = screenHeight - windowHeight
const statusBarHeight = StatusBar.currentHeight

export {navbarHeight, statusBarHeight}
