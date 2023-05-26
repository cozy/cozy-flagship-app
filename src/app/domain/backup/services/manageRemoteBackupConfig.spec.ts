import * as manageRemoteBackupConfig from '/app/domain/backup/services/manageRemoteBackupConfig'
import * as manageLocalBackupConfig from '/app/domain/backup/services/manageLocalBackupConfig'

import type CozyClient from 'cozy-client'

describe('fetchRemoteBackupConfigs', () => {
  const mockClientWithFindReferencedByResult = (
    findReferencedByResult: unknown
  ): CozyClient =>
    ({
      collection: () => ({
        findReferencedBy: () => findReferencedByResult
      })
    } as unknown as CozyClient)

  test('returns an empty array when findReferencedBy returns an empty array', async () => {
    // Given
    const client = mockClientWithFindReferencedByResult({ included: [] })

    // When
    const remoteBackupConfigs =
      await manageRemoteBackupConfig.fetchRemoteBackupConfigs(client)

    // Then
    expect(remoteBackupConfigs).toEqual([])
  })

  test('returns an array with the correct backup folders when findReferencedBy returns an array with two items', async () => {
    // Given
    const client = mockClientWithFindReferencedByResult({
      included: [
        {
          attributes: { name: 'Device 1', path: '/Backup/Device 1' }
        },
        {
          attributes: { name: 'Device 2', path: '/Backup/Device 2' }
        }
      ]
    })

    // When
    const remoteBackupConfigs =
      await manageRemoteBackupConfig.fetchRemoteBackupConfigs(client)

    // Then
    expect(remoteBackupConfigs).toEqual([
      { backupFolder: { name: 'Device 1', path: '/Backup/Device 1' } },
      { backupFolder: { name: 'Device 2', path: '/Backup/Device 2' } }
    ])
  })
})

describe('isRemoteBackupConfigFromDevice', () => {
  test('returns true when the remote backup config does correspond to device name', () => {
    const remoteBackupConfig = {
      backupFolder: { name: 'Device 1', path: '/Backup/Device 1' }
    }
    const deviceName = 'Device 1'

    expect(
      manageRemoteBackupConfig.isRemoteBackupConfigFromDevice(
        remoteBackupConfig,
        deviceName
      )
    ).toBe(true)
  })

  test('returns false when the remote backup config does not correspond to device name', () => {
    const remoteBackupConfig = {
      backupFolder: { name: 'Device 1', path: '/Backup/Device 1' }
    }
    const deviceName = 'Device 2'

    expect(
      manageRemoteBackupConfig.isRemoteBackupConfigFromDevice(
        remoteBackupConfig,
        deviceName
      )
    ).toBe(false)
  })
})

describe('fetchDeviceRemoteBackupConfig', () => {
  it('returns the backup folder if isRemoteBackupConfigFromDevice is true', async () => {
    jest
      .spyOn(manageRemoteBackupConfig, 'fetchRemoteBackupConfigs')
      .mockResolvedValue([
        { backupFolder: { name: 'Device 1', path: '/Backup/Device 1' } }
      ])
    jest
      .spyOn(manageLocalBackupConfig, 'getLocalBackupConfig')
      .mockResolvedValue({
        remotePath: '/Backup/Device 1',
        lastBackupDate: 0,
        backupedMedias: []
      })
    jest
      .spyOn(manageRemoteBackupConfig, 'isRemoteBackupConfigFromDevice')
      .mockReturnValue(true)

    const remoteBackupConfig =
      await manageRemoteBackupConfig.fetchDeviceRemoteBackupConfig(
        {} as CozyClient
      )

    expect(remoteBackupConfig?.backupFolder.path).toEqual('/Backup/Device 1')
  })

  it('returns undefined if isRemoteBackupConfigFromDevice is false', async () => {
    jest
      .spyOn(manageRemoteBackupConfig, 'fetchRemoteBackupConfigs')
      .mockResolvedValue([
        { backupFolder: { name: 'Device 1', path: '/Backup/Device 1' } }
      ])
    jest
      .spyOn(manageLocalBackupConfig, 'getLocalBackupConfig')
      .mockResolvedValue({
        remotePath: '/Backup/Device 1',
        lastBackupDate: 0,
        backupedMedias: []
      })
    jest
      .spyOn(manageRemoteBackupConfig, 'isRemoteBackupConfigFromDevice')
      .mockReturnValue(false)

    const remoteBackupConfig =
      await manageRemoteBackupConfig.fetchDeviceRemoteBackupConfig(
        {} as CozyClient
      )

    expect(remoteBackupConfig).toBeUndefined()
  })
})
