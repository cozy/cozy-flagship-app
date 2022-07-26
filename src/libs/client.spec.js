import { createClient } from '/libs/client'
import CozyClient from 'cozy-client'

jest.genMockFromModule('cozy-client')
jest.mock('cozy-client')
import { getDeviceName } from 'react-native-device-info'

jest.mock('react-native-device-info')

let mockSetUri = jest.fn()
let mockRegister = jest.fn()
const mockCozyClient = {
  getStackClient: jest.fn().mockReturnValue({
    setUri: mockSetUri,
    register: mockRegister
  })
}

CozyClient.mockImplementation(() => mockCozyClient)

describe('client', () => {
  describe('createClient', () => {
    const instance = {}

    it('should await device name before creating cozy client', async () => {
      // Given
      getDeviceName.mockResolvedValue("Becca's iPhone 6")

      // When
      await createClient(instance)

      // Then
      expect(CozyClient).toHaveBeenCalledWith({
        oauth: {
          certificationConfig: {
            androidSafetyNetApiKey: 'foo'
          },
          clientKind: 'mobile',
          clientName: "Cloud Personnel (Becca's iPhone 6)",
          redirectURI: 'cozy://',
          shouldRequireFlagshipPermissions: true,
          softwareID: 'amiral'
        },
        scope: ['*']
      })
    })

    it('should set instance uri', async () => {
      // When
      await createClient(instance)

      // Then
      expect(mockSetUri).toHaveBeenCalledWith(instance)
    })

    it('should await register instance', async () => {
      // When
      await createClient(instance)

      // Then
      expect(mockRegister).toHaveBeenCalledWith(instance)
    })

    it('should return client', async () => {
      // When
      const client = await createClient(instance)

      // Then
      expect(client).toEqual(mockCozyClient)
    })
  })
})
