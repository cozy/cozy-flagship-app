import RNFS from 'react-native-fs'

import CozyClient from 'cozy-client/types/CozyClient'

import { handleCleanup } from '/libs/cozyAppBundle/cozyAppBundle.functions'

jest.mock('@fengweichong/react-native-gzip', () => ({}))

// @ts-expect-error: We want to overwrite the read-only property
RNFS.DocumentDirectoryPath = 'SOME_DocumentDirectoryPath'

describe('handleCleanup', () => {
  it('should delete all cache folders for the given slug that are not in the versionsToKeep array', async () => {
    const versionsToKeep = ['1.0.0', '1.0.3']
    const slug = 'test'
    const client = {
      getStackClient: (): { uri: string } => ({
        uri: 'https://test.cozy.tools:8080'
      })
    } as CozyClient

    jest
      .spyOn(RNFS, 'readDir')
      .mockResolvedValue([
        { name: '1.0.0' },
        { name: '1.0.1' },
        { name: '1.0.2' },
        { name: '1.0.3' }
      ] as RNFS.ReadDirItem[])

    const deleteFolderSpy = jest.spyOn(RNFS, 'unlink')

    await handleCleanup({
      client,
      slug,
      versionsToKeep
    })

    expect(deleteFolderSpy).not.toHaveBeenCalledWith(
      'SOME_DocumentDirectoryPath/test.cozy.tools_8080/test/1.0.0'
    )

    expect(deleteFolderSpy).not.toHaveBeenCalledWith(
      'SOME_DocumentDirectoryPath/test.cozy.tools_8080/test/1.0.3'
    )

    expect(deleteFolderSpy).toHaveBeenNthCalledWith(
      1,
      'SOME_DocumentDirectoryPath/test.cozy.tools_8080/test/1.0.1'
    )

    expect(deleteFolderSpy).toHaveBeenNthCalledWith(
      2,
      'SOME_DocumentDirectoryPath/test.cozy.tools_8080/test/1.0.2'
    )
  })
  it('should not delete embedded folder', async () => {
    const versionsToKeep = ['1.0.0', '1.0.3']
    const slug = 'test'
    const client = {
      getStackClient: (): { uri: string } => ({
        uri: 'https://test.cozy.tools:8080'
      })
    } as CozyClient

    jest
      .spyOn(RNFS, 'readDir')
      .mockResolvedValue([
        { name: '1.0.0' },
        { name: '1.0.1' },
        { name: '1.0.2' },
        { name: 'embedded' },
        { name: '1.0.3' }
      ] as RNFS.ReadDirItem[])

    const deleteFolderSpy = jest.spyOn(RNFS, 'unlink')

    await handleCleanup({
      client,
      slug,
      versionsToKeep
    })

    expect(deleteFolderSpy).not.toHaveBeenCalledWith(
      'SOME_DocumentDirectoryPath/test.cozy.tools_8080/test/embedded'
    )
    expect(deleteFolderSpy).not.toHaveBeenCalledWith(
      'SOME_DocumentDirectoryPath/test.cozy.tools_8080/test/1.0.0'
    )

    expect(deleteFolderSpy).not.toHaveBeenCalledWith(
      'SOME_DocumentDirectoryPath/test.cozy.tools_8080/test/1.0.3'
    )

    expect(deleteFolderSpy).toHaveBeenNthCalledWith(
      1,
      'SOME_DocumentDirectoryPath/test.cozy.tools_8080/test/1.0.1'
    )

    expect(deleteFolderSpy).toHaveBeenNthCalledWith(
      2,
      'SOME_DocumentDirectoryPath/test.cozy.tools_8080/test/1.0.2'
    )
  })
})
