import { shim } from 'react-native-quick-base64'

shim()

// Avoid using node dependent modules
process.browser = true
