import { getServerBaseFolder } from './httpPaths'

const MOCK_DIRECTORY_PATH = 'SOME_DocumentDirectoryPath'

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: 'SOME_DocumentDirectoryPath'
}))

describe('httpPaths', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getServerBaseFolder', () => {
    it(`to return DocumentDirectoryPath from RNFS`, async () => {
      const result = getServerBaseFolder()

      expect(result).toBe(MOCK_DIRECTORY_PATH)
    })
  })
})
