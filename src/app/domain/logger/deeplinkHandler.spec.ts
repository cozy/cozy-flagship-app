import CozyClient from 'cozy-client'

import { handleLogsDeepLink } from '/app/domain/logger/deeplinkHandler'
import {
  disableLogs,
  enableLogs,
  sendLogs
} from '/app/domain/logger/fileLogger'

jest.mock('/app/domain/logger/fileLogger')

describe('deeplinkHandler', () => {
  describe('handleLogsDeepLink', () => {
    it('should handle EnableLogs deep links', () => {
      const client = new CozyClient()

      handleLogsDeepLink(
        'https://links.mycozy.cloud/flagship/enablelogs',
        client
      )

      expect(enableLogs).toHaveBeenCalled()
    })

    it('should handle DisableLogs deep links', () => {
      const client = new CozyClient()

      handleLogsDeepLink(
        'https://links.mycozy.cloud/flagship/disablelogs',
        client
      )

      expect(disableLogs).toHaveBeenCalled()
    })

    it('should handle SendLog deep links', () => {
      const client = new CozyClient()

      handleLogsDeepLink('https://links.mycozy.cloud/flagship/sendlogs', client)

      expect(sendLogs).toHaveBeenCalled()
    })
  })
})
