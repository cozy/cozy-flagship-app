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
          _id: '1',
          attributes: {
            name: 'Device 1',
            path: '/Backup/Device 1',
            metadata: { backupDeviceIds: ['A'] }
          }
        },
        {
          _id: '2',
          attributes: {
            name: 'Device 2',
            path: '/Backup/Device 2',
            metadata: { backupDeviceIds: ['B'] }
          }
        }
      ]
    })

    // When
    const remoteBackupConfigs =
      await manageRemoteBackupConfig.fetchRemoteBackupConfigs(client)

    // Then
    expect(remoteBackupConfigs).toEqual([
      {
        backupFolder: { id: '1', name: 'Device 1', path: '/Backup/Device 1' },
        backupDeviceIds: ['A']
      },
      {
        backupFolder: { id: '2', name: 'Device 2', path: '/Backup/Device 2' },
        backupDeviceIds: ['B']
      }
    ])
  })
})

describe('isRemoteBackupConfigFromDevice', () => {
  test('returns true when the remote backup config does correspond to device', () => {
    const remoteBackupConfig = {
      backupFolder: { id: '1', name: 'Device 1', path: '/Backup/Device 1' },
      backupDeviceIds: ['A']
    }
    const deviceId = 'A'

    expect(
      manageRemoteBackupConfig.isRemoteBackupConfigFromDevice(
        remoteBackupConfig,
        deviceId
      )
    ).toBe(true)
  })

  test('returns false when the remote backup config does not correspond to device', () => {
    const remoteBackupConfig = {
      backupFolder: { id: '2', name: 'Device 1', path: '/Backup/Device 1' },
      backupDeviceIds: ['A']
    }
    const deviceId = 'B'

    expect(
      manageRemoteBackupConfig.isRemoteBackupConfigFromDevice(
        remoteBackupConfig,
        deviceId
      )
    ).toBe(false)
  })
})

describe('fetchDeviceRemoteBackupConfig', () => {
  it('returns the backup folder if isRemoteBackupConfigFromDevice is true', async () => {
    jest
      .spyOn(manageRemoteBackupConfig, 'fetchRemoteBackupConfigs')
      .mockResolvedValue([
        {
          backupFolder: { id: '1', name: 'Device 1', path: '/Backup/Device 1' },
          backupDeviceIds: ['A']
        }
      ])
    jest
      .spyOn(manageLocalBackupConfig, 'getLocalBackupConfig')
      .mockResolvedValue({
        remoteBackupConfig: {
          backupFolder: {
            id: '1',
            name: 'Device 1',
            path: '/Backup/Device 1'
          },
          backupDeviceIds: ['A']
        },
        lastBackupDate: 0,
        backupedMedias: [],
        backupedAlbums: [],
        currentBackup: {
          status: 'to_do',
          mediasToBackup: [],
          totalMediasToBackupCount: 0
        }
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
        {
          backupFolder: { id: '1', name: 'Device 1', path: '/Backup/Device 1' },
          backupDeviceIds: ['A']
        }
      ])
    jest
      .spyOn(manageLocalBackupConfig, 'getLocalBackupConfig')
      .mockResolvedValue({
        remoteBackupConfig: {
          backupFolder: {
            id: '1',
            name: 'Device 1',
            path: '/Backup/Device 1'
          },
          backupDeviceIds: ['A']
        },
        lastBackupDate: 0,
        backupedMedias: [],
        backupedAlbums: [],
        currentBackup: {
          status: 'to_do',
          mediasToBackup: [],
          totalMediasToBackupCount: 0
        }
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
