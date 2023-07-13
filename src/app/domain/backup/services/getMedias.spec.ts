import { Platform } from 'react-native'
import RNFS from 'react-native-fs'

import * as getMedias from '/app/domain/backup/services/getMedias'

describe('getRemotePath', () => {
  test('return / on iOS', () => {
    // Given
    const path = 'file:///storage/emulated/0/Pictures/IMG_20230713_103203.jpg'
    Platform.OS = 'ios'
    // @ts-expect-error We want to modify this read only property for test purpose
    RNFS.ExternalStorageDirectoryPath = '/storage/emulated/0'

    // When
    const remotePath = getMedias.getRemotePath(path)

    // Then
    expect(remotePath).toBe('/')
  })

  test('return remote path on Android', () => {
    // Given
    const path = 'file:///storage/emulated/0/Pictures/IMG_20230713_103203.jpg'
    Platform.OS = 'android'
    // @ts-expect-error We want to modify this read only property for test purpose
    RNFS.ExternalStorageDirectoryPath = '/storage/emulated/0'

    // When
    const remotePath = getMedias.getRemotePath(path)

    // Then
    expect(remotePath).toBe('/Pictures')
  })
})
