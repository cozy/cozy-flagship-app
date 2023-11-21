import RNFS, { StatResult } from 'react-native-fs'

import { AcceptFromFlagshipManifest } from '/app/domain/osReceive/models/OsReceiveCozyApp'
import { OsReceiveFile } from '/app/domain/osReceive/models/OsReceiveState'
import { getAppsForUpload } from '/app/domain/osReceive/services/OsReceiveCandidateApps'

jest.mock('react-native-fs', () => ({
  stat: jest.fn()
}))

const mockedStat = RNFS.stat as jest.MockedFunction<typeof RNFS.stat>

describe('OsReceiveCandidateApps Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedStat.mockResolvedValue({
      size: 3000
    } as unknown as StatResult)
  })

  describe('getAppsForUpload', () => {
    describe('Check Mimes', () => {
      it('Should enable JPG compatible app for JPG file', async () => {
        const app = {
          name: 'Some App',
          slug: 'someslug',
          accept_from_flagship: true,
          accept_documents_from_flagship: {
            accepted_mime_types: ['image/jpeg'],
            max_number_of_files: 1,
            max_size_per_file_in_MB: 10,
            route_to_upload: '/#/paper/create?fromFlagshipUpload=true'
          }
        } as unknown as AcceptFromFlagshipManifest
        const appsForUpload = await getAppsForUpload([jpgFile], [app])

        expect(appsForUpload).toStrictEqual([
          {
            name: 'Some App',
            routeToUpload: '/#/paper/create?fromFlagshipUpload=true',
            slug: 'someslug',
            reasonDisabled: undefined
          }
        ])
      })

      it('Should disable JPG only app for PDF file', async () => {
        const app = {
          name: 'Some App',
          slug: 'someslug',
          accept_from_flagship: true,
          accept_documents_from_flagship: {
            accepted_mime_types: ['image/jpeg'],
            max_number_of_files: 1,
            max_size_per_file_in_MB: 10,
            route_to_upload: '/#/paper/create?fromFlagshipUpload=true'
          }
        } as unknown as AcceptFromFlagshipManifest
        const appsForUpload = await getAppsForUpload([pdfFile], [app])

        expect(appsForUpload).toStrictEqual([
          {
            name: 'Some App',
            routeToUpload: '/#/paper/create?fromFlagshipUpload=true',
            slug: 'someslug',
            reasonDisabled: [
              'services.osReceive.disableReasons.incompatibleMime'
            ]
          }
        ])
      })

      it('Should enable ALL MIME app for PDF file', async () => {
        const app = {
          name: 'Some App',
          slug: 'someslug',
          accept_from_flagship: true,
          accept_documents_from_flagship: {
            accepted_mime_types: ['*/*'],
            max_number_of_files: 1,
            max_size_per_file_in_MB: 10,
            route_to_upload: '/#/paper/create?fromFlagshipUpload=true'
          }
        } as unknown as AcceptFromFlagshipManifest
        const appsForUpload = await getAppsForUpload([pdfFile], [app])

        expect(appsForUpload).toStrictEqual([
          {
            name: 'Some App',
            routeToUpload: '/#/paper/create?fromFlagshipUpload=true',
            slug: 'someslug',
            reasonDisabled: undefined
          }
        ])
      })
    })

    describe('Check number of files', () => {
      it('Should enable app if under max number of files', async () => {
        const app = {
          name: 'Some App',
          slug: 'someslug',
          accept_from_flagship: true,
          accept_documents_from_flagship: {
            accepted_mime_types: ['image/jpeg'],
            max_number_of_files: 4,
            max_size_per_file_in_MB: 10,
            route_to_upload: '/#/paper/create?fromFlagshipUpload=true'
          }
        } as unknown as AcceptFromFlagshipManifest
        const appsForUpload = await getAppsForUpload(
          [jpgFile, jpgFile, jpgFile],
          [app]
        )

        expect(appsForUpload).toStrictEqual([
          {
            name: 'Some App',
            routeToUpload: '/#/paper/create?fromFlagshipUpload=true',
            slug: 'someslug',
            reasonDisabled: undefined
          }
        ])
      })

      it('Should disable app if too many files', async () => {
        const app = {
          name: 'Some App',
          slug: 'someslug',
          accept_from_flagship: true,
          accept_documents_from_flagship: {
            accepted_mime_types: ['image/jpeg'],
            max_number_of_files: 2,
            max_size_per_file_in_MB: 10,
            route_to_upload: '/#/paper/create?fromFlagshipUpload=true'
          }
        } as unknown as AcceptFromFlagshipManifest
        const appsForUpload = await getAppsForUpload(
          [jpgFile, jpgFile, jpgFile],
          [app]
        )

        expect(appsForUpload).toStrictEqual([
          {
            name: 'Some App',
            routeToUpload: '/#/paper/create?fromFlagshipUpload=true',
            slug: 'someslug',
            reasonDisabled: ['services.osReceive.disableReasons.tooManyFiles']
          }
        ])
      })

      it('Should disable app if app accept only one file but more are received', async () => {
        const app = {
          name: 'Some App',
          slug: 'someslug',
          accept_from_flagship: true,
          accept_documents_from_flagship: {
            accepted_mime_types: ['image/jpeg'],
            max_number_of_files: 1,
            max_size_per_file_in_MB: 10,
            route_to_upload: '/#/paper/create?fromFlagshipUpload=true'
          }
        } as unknown as AcceptFromFlagshipManifest
        const appsForUpload = await getAppsForUpload(
          [jpgFile, jpgFile, jpgFile],
          [app]
        )

        expect(appsForUpload).toStrictEqual([
          {
            name: 'Some App',
            routeToUpload: '/#/paper/create?fromFlagshipUpload=true',
            slug: 'someslug',
            reasonDisabled: ['services.osReceive.disableReasons.multipleFiles']
          }
        ])
      })

      it('Should enable app if exact number of files', async () => {
        const app = {
          name: 'Some App',
          slug: 'someslug',
          accept_from_flagship: true,
          accept_documents_from_flagship: {
            accepted_mime_types: ['image/jpeg'],
            max_number_of_files: 3,
            max_size_per_file_in_MB: 10,
            route_to_upload: '/#/paper/create?fromFlagshipUpload=true'
          }
        } as unknown as AcceptFromFlagshipManifest
        const appsForUpload = await getAppsForUpload(
          [jpgFile, jpgFile, jpgFile],
          [app]
        )

        expect(appsForUpload).toStrictEqual([
          {
            name: 'Some App',
            routeToUpload: '/#/paper/create?fromFlagshipUpload=true',
            slug: 'someslug',
            reasonDisabled: undefined
          }
        ])
      })
    })

    describe('Check files sizes', () => {
      it('Should disable app if file over max size', async () => {
        mockedStat.mockResolvedValue({
          size: 11000000
        } as unknown as StatResult)

        const app = {
          name: 'Some App',
          slug: 'someslug',
          accept_from_flagship: true,
          accept_documents_from_flagship: {
            accepted_mime_types: ['image/jpeg'],
            max_number_of_files: 4,
            max_size_per_file_in_MB: 10,
            route_to_upload: '/#/paper/create?fromFlagshipUpload=true'
          }
        } as unknown as AcceptFromFlagshipManifest
        const appsForUpload = await getAppsForUpload(
          [jpgFile, jpgFile, jpgFile],
          [app]
        )

        expect(appsForUpload).toStrictEqual([
          {
            name: 'Some App',
            routeToUpload: '/#/paper/create?fromFlagshipUpload=true',
            slug: 'someslug',
            reasonDisabled: ['services.osReceive.disableReasons.tooLargeFiles']
          }
        ])
      })
    })

    describe('Override app name', () => {
      it('Should override mespapiers app name', async () => {
        const app = {
          name: 'Some App',
          slug: 'mespapiers',
          accept_from_flagship: true,
          accept_documents_from_flagship: {
            accepted_mime_types: ['image/jpeg'],
            max_number_of_files: 4,
            max_size_per_file_in_MB: 10,
            route_to_upload: '/#/paper/create?fromFlagshipUpload=true'
          }
        } as unknown as AcceptFromFlagshipManifest
        const appsForUpload = await getAppsForUpload(
          [jpgFile, jpgFile, jpgFile],
          [app]
        )

        expect(appsForUpload).toStrictEqual([
          {
            name: 'services.osReceive.appNameOverrides.mespapiers',
            routeToUpload: '/#/paper/create?fromFlagshipUpload=true',
            slug: 'mespapiers',
            reasonDisabled: undefined
          }
        ])
      })

      it('Should override cozy-drive app name', async () => {
        const app = {
          name: 'Some App',
          slug: 'drive',
          accept_from_flagship: true,
          accept_documents_from_flagship: {
            accepted_mime_types: ['image/jpeg'],
            max_number_of_files: 4,
            max_size_per_file_in_MB: 10,
            route_to_upload: '/#/paper/create?fromFlagshipUpload=true'
          }
        } as unknown as AcceptFromFlagshipManifest
        const appsForUpload = await getAppsForUpload(
          [jpgFile, jpgFile, jpgFile],
          [app]
        )

        expect(appsForUpload).toStrictEqual([
          {
            name: 'services.osReceive.appNameOverrides.drive',
            routeToUpload: '/#/paper/create?fromFlagshipUpload=true',
            slug: 'drive',
            reasonDisabled: undefined
          }
        ])
      })

      it('Should override cozy-photo app name', async () => {
        const app = {
          name: 'Some App',
          slug: 'photos',
          accept_from_flagship: true,
          accept_documents_from_flagship: {
            accepted_mime_types: ['image/jpeg'],
            max_number_of_files: 4,
            max_size_per_file_in_MB: 10,
            route_to_upload: '/#/paper/create?fromFlagshipUpload=true'
          }
        } as unknown as AcceptFromFlagshipManifest
        const appsForUpload = await getAppsForUpload(
          [jpgFile, jpgFile, jpgFile],
          [app]
        )

        expect(appsForUpload).toStrictEqual([
          {
            name: 'services.osReceive.appNameOverrides.photos',
            routeToUpload: '/#/paper/create?fromFlagshipUpload=true',
            slug: 'photos',
            reasonDisabled: undefined
          }
        ])
      })
    })

    describe('Order apps', () => {
      it('Should put cozy-drive in last position', async () => {
        const app = {
          name: 'Some App',
          slug: 'mespapiers',
          accept_from_flagship: true,
          accept_documents_from_flagship: {
            accepted_mime_types: ['image/jpeg'],
            max_number_of_files: 4,
            max_size_per_file_in_MB: 10,
            route_to_upload: 'SOME_PATH'
          }
        } as unknown as AcceptFromFlagshipManifest

        const photo = {
          name: 'Some App',
          slug: 'photos',
          accept_from_flagship: true,
          accept_documents_from_flagship: {
            accepted_mime_types: ['image/jpeg'],
            max_number_of_files: 4,
            max_size_per_file_in_MB: 10,
            route_to_upload: 'SOME_PATH'
          }
        } as unknown as AcceptFromFlagshipManifest

        const drive = {
          name: 'Some App',
          slug: 'drive',
          accept_from_flagship: true,
          accept_documents_from_flagship: {
            accepted_mime_types: ['image/jpeg'],
            max_number_of_files: 4,
            max_size_per_file_in_MB: 10,
            route_to_upload: 'SOME_PATH'
          }
        } as unknown as AcceptFromFlagshipManifest

        const appsForUpload = await getAppsForUpload(
          [jpgFile, jpgFile, jpgFile],
          [app, photo, drive, photo, app]
        )

        expect(appsForUpload).toStrictEqual([
          {
            name: 'services.osReceive.appNameOverrides.mespapiers',
            routeToUpload: 'SOME_PATH',
            slug: 'mespapiers',
            reasonDisabled: undefined
          },
          {
            name: 'services.osReceive.appNameOverrides.photos',
            routeToUpload: 'SOME_PATH',
            slug: 'photos',
            reasonDisabled: undefined
          },
          {
            name: 'services.osReceive.appNameOverrides.photos',
            routeToUpload: 'SOME_PATH',
            slug: 'photos',
            reasonDisabled: undefined
          },
          {
            name: 'services.osReceive.appNameOverrides.mespapiers',
            routeToUpload: 'SOME_PATH',
            slug: 'mespapiers',
            reasonDisabled: undefined
          },
          {
            name: 'services.osReceive.appNameOverrides.drive',
            routeToUpload: 'SOME_PATH',
            slug: 'drive',
            reasonDisabled: undefined
          }
        ])
      })
    })
  })
})

const jpgFile: OsReceiveFile = {
  name: 'SOME_IMAGE.JPG',
  file: {
    filePath: 'file:///SOME_PATH/SOME_IMAGE.JPG',
    text: null,
    weblink: null,
    mimeType: '.jpg',
    contentUri: null,
    fileName: 'SOME_IMAGE.JPG',
    extension: 'JPG',
    fromFlagship: true
  },
  status: 0
}

const pdfFile: OsReceiveFile = {
  name: 'SOME_DOCUMENT.PDF',
  file: {
    filePath: 'file:///SOME_PATH/SOME_DOCUMENT.PDF',
    text: null,
    weblink: null,
    mimeType: '.pdf',
    contentUri: null,
    fileName: 'SOME_IMAGE.PDF',
    extension: 'PDF',
    fromFlagship: true
  },
  status: 0
}
