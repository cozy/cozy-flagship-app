import RNPrint from 'react-native-print'

import MiniLog from 'cozy-minilog'

const log = MiniLog('intents:print')

export const printBase64Doc = (base64?: string): void => {
  log.info('printBase64Doc', base64, RNPrint)
}
