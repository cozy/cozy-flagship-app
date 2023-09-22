import * as manageRemoteBackupConfig from '/app/domain/backup/services/manageRemoteBackupConfig'
import * as manageLocalBackupConfig from '/app/domain/backup/services/manageLocalBackupConfig'
import { LocalBackupConfig } from '/app/domain/backup/models'

import type CozyClient from 'cozy-client'

const IMG_0001 = {
  creationDate: 1299975445000,
  md5: 'Y0VRfq0vJ3b2gOxZjk31WQ==',
  modificationDate: 1441224147000,
  name: 'IMG_0001.JPG',
  remoteId: 'c3843c5245f8a47c56a185d13f8483c6',
  uri: 'ph://106E99A1-4F6A-45A2-B320-B0AD4A8E8473/L0/001'
}

const IMG_0002 = {
  creationDate: 1255122560000,
  md5: 'LcGi/CqoM7ALktxDiKhhOQ==',
  modificationDate: 1441224147000,
  name: 'IMG_0002.JPG',
  remoteId: 'c3843c5245f8a47c56a185d13f848d27',
  uri: 'ph://B84E8479-475C-4727-A4A4-B77AA9980897/L0/001'
}

describe('addRemoteDuplicatesToBackupedMedias', () => {
  test('should merge previous backuped medias with new remote duplicates found', async () => {
    // Given
    jest
      .spyOn(manageLocalBackupConfig, 'getLocalBackupConfig')
      .mockResolvedValue(
        Promise.resolve({
          backupedMedias: [IMG_0001]
        } as LocalBackupConfig)
      )

    jest
      .spyOn(manageRemoteBackupConfig, 'fetchBackupedMedias')
      .mockResolvedValue(Promise.resolve([IMG_0002]))

    const setLocalBackupConfigMock = jest
      .spyOn(manageLocalBackupConfig, 'setLocalBackupConfig')
      .mockResolvedValue(Promise.resolve())

    // When
    await manageLocalBackupConfig.addRemoteDuplicatesToBackupedMedias(
      {} as CozyClient
    )

    const newLocalBackupConfig = setLocalBackupConfigMock.mock.calls[0][1]

    // Then
    expect(newLocalBackupConfig.backupedMedias.length).toBe(2)
  })

  test('should not create duplicates in backuped media list when remote duplicate is already in backuped media list', async () => {
    // Given
    jest
      .spyOn(manageLocalBackupConfig, 'getLocalBackupConfig')
      .mockResolvedValue(
        Promise.resolve({
          backupedMedias: [IMG_0001]
        } as LocalBackupConfig)
      )

    jest
      .spyOn(manageRemoteBackupConfig, 'fetchBackupedMedias')
      .mockResolvedValue(Promise.resolve([IMG_0001]))

    const setLocalBackupConfigMock = jest
      .spyOn(manageLocalBackupConfig, 'setLocalBackupConfig')
      .mockResolvedValue(Promise.resolve())

    // When
    await manageLocalBackupConfig.addRemoteDuplicatesToBackupedMedias(
      {} as CozyClient
    )
    const newLocalStorage = setLocalBackupConfigMock.mock.calls[0][1]

    // Then
    expect(newLocalStorage.backupedMedias.length).toBe(1)
  })
})
