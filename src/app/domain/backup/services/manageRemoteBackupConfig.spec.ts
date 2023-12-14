import * as manageRemoteBackupConfig from '/app/domain/backup/services/manageRemoteBackupConfig'

import type CozyClient from 'cozy-client'
import flag from 'cozy-flags'

import { Media } from '/app/domain/backup/models'
import { File } from '/app/domain/backup/queries'

jest.mock('cozy-flags')

const mockedFlag = flag as jest.MockedFunction<typeof flag>

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

  test('returns an array with backup folders sorted by most recent first when findReferencedBy returns an array with two items', async () => {
    // Given
    const client = mockClientWithFindReferencedByResult({
      included: [
        {
          _id: '1',
          attributes: {
            created_at: '2023-11-28T12:00:31.541756+01:00',
            name: 'Device 1',
            path: '/Backup/Device 1',
            metadata: { backupDeviceIds: ['A'] }
          }
        },
        {
          _id: '2',
          attributes: {
            created_at: '2023-11-28T12:10:00.402741+01:00',
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
        backupFolder: { id: '2', name: 'Device 2', path: '/Backup/Device 2' },
        backupDeviceIds: ['B']
      },
      {
        backupFolder: { id: '1', name: 'Device 1', path: '/Backup/Device 1' },
        backupDeviceIds: ['A']
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
      .spyOn(manageRemoteBackupConfig, 'isRemoteBackupConfigFromDevice')
      .mockReturnValue(false)

    const remoteBackupConfig =
      await manageRemoteBackupConfig.fetchDeviceRemoteBackupConfig(
        {} as CozyClient
      )

    expect(remoteBackupConfig).toBeUndefined()
  })
})

describe('isFileCorrespondingToMedia', () => {
  it('true when creationDateFromLibrary exists in file and corresponds to creationDate in media', () => {
    const file = {
      metadata: {
        creationDateFromLibrary: new Date(2021, 0, 0, 10, 0, 0).getTime() // good date
      },
      created_at: new Date(2021, 0, 0, 9, 0, 0).getTime() // bad date (bad EXIF)
    } as unknown as File

    const media = {
      creationDate: new Date(2021, 0, 0, 10, 0, 0).getTime()
    } as unknown as Media

    expect(
      manageRemoteBackupConfig.isFileCorrespondingToMedia(file, media)
    ).toBe(true)
  })

  it('false when creationDateFromLibrary exists in file and do not correspond to creationDate in media', () => {
    const file = {
      metadata: {
        creationDateFromLibrary: new Date(2021, 0, 0, 10, 0, 0).getTime() // good date
      },
      created_at: new Date(2021, 0, 0, 9, 0, 0).getTime() // bad date (bad EXIF)
    } as unknown as File

    const media = {
      creationDate: new Date(2021, 0, 1, 10, 0, 0).getTime()
    } as unknown as Media

    expect(
      manageRemoteBackupConfig.isFileCorrespondingToMedia(file, media)
    ).toBe(false)
  })

  it('true when only created_at exists in file and corresponds to creationDate in media', () => {
    const file = {
      created_at: new Date(2021, 0, 0, 10, 0, 0).getTime() // good date (lucky EXIF)
    } as unknown as File

    const media = {
      creationDate: new Date(2021, 0, 0, 10, 0, 0).getTime()
    } as unknown as Media

    expect(
      manageRemoteBackupConfig.isFileCorrespondingToMedia(file, media)
    ).toBe(true)
  })

  it('false when file only created_at exists and do not correspond to creationDate in media', () => {
    const file = {
      created_at: new Date(2021, 0, 0, 10, 0, 0).getTime() // good date (lucky EXIF)
    } as unknown as File

    const media = {
      creationDate: new Date(2021, 0, 1, 10, 0, 0).getTime()
    } as unknown as Media

    expect(
      manageRemoteBackupConfig.isFileCorrespondingToMedia(file, media)
    ).toBe(false)
  })

  it('true when only created_at exists in file and corresponds with day/minute to creationDate in media with dedup mode', () => {
    mockedFlag.mockReturnValue(true)

    const file = {
      created_at: new Date(2021, 0, 0, 9, 0, 0).getTime() // bad date (bad EXIF)
    } as unknown as File

    const media = {
      creationDate: new Date(2021, 0, 0, 10, 0, 0).getTime()
    } as unknown as Media

    expect(
      manageRemoteBackupConfig.isFileCorrespondingToMedia(file, media)
    ).toBe(true)
  })

  it('false when only created_at exists in file and corresponds with day/minute to creationDate in media without dedup mode', () => {
    mockedFlag.mockReturnValue(false)

    const file = {
      created_at: new Date(2021, 0, 0, 9, 0, 0).getTime() // bad date (bad EXIF)
    } as unknown as File

    const media = {
      creationDate: new Date(2021, 0, 0, 10, 0, 0).getTime()
    } as unknown as Media

    expect(
      manageRemoteBackupConfig.isFileCorrespondingToMedia(file, media)
    ).toBe(false)
  })
})
