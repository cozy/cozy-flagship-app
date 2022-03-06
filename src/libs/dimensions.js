import {Dimensions} from 'react-native'
import {getStatusBarHeight} from 'react-native-status-bar-height'

const screenHeight = Dimensions.get('screen').height
const windowHeight = Dimensions.get('window').height
const navbarHeight = screenHeight - windowHeight
const statusBarHeight = getStatusBarHeight()

export {navbarHeight, statusBarHeight}
