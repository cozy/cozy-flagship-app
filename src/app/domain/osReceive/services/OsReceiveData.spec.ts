import { _onReceiveFiles } from '/app/domain/osReceive/services/OsReceiveData'
import {
  AndroidReceivedFileFixture,
  AndroidReceivedFileFixtures
} from '/app/domain/osReceive/fixtures/AndroidReceivedFile'
import {
  iOSReceivedFileFixture,
  iOSReceivedFileFixtures
} from '/app/domain/osReceive/fixtures/iOSReceivedFile'
import { OsReceiveFile } from '/app/domain/osReceive/models/OsReceiveState'

describe('onReceiveFiles', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {
      // noop
    })
  })

  it('should process Android file correctly', () => {
    const result = _onReceiveFiles(AndroidReceivedFileFixture)

    const expected: OsReceiveFile[] = [
      {
        file: {
          contentUri:
            'content://com.android.providers.downloads.documents/document/foo%1A23',
          extension: 'pdf',
          fileName: '123_foo_bar_baz_45.67EUR.pdf',
          filePath:
            '/data/user/0/io.cozy.flagship.mobile/cache/123_foo_bar_baz_45.67EUR.pdf',
          fromFlagship: true,
          mimeType: 'application/pdf',
          subject: null
        },
        name: '123_foo_bar_baz_45.67EUR.pdf',
        status: 0,
        type: 'application/pdf'
      }
    ]

    expect(result).toEqual(expected)
  })

  it('should process Android files correctly', () => {
    const result = _onReceiveFiles(AndroidReceivedFileFixtures)

    const expected: OsReceiveFile[] = [
      {
        file: {
          contentUri:
            'content://com.android.providers.downloads.documents/document/foo%1A23',
          extension: 'pdf',
          fileName: '123_foo_bar_baz_45.67EUR.pdf',
          filePath:
            '/data/user/0/io.cozy.flagship.mobile/cache/123_foo_bar_baz_45.67EUR.pdf',
          fromFlagship: true,
          mimeType: 'application/pdf',
          subject: null
        },
        name: '123_foo_bar_baz_45.67EUR.pdf',
        status: 0,
        type: 'application/pdf'
      },
      {
        file: {
          contentUri:
            'content://com.android.providers.downloads.documents/document/foo%1A232',
          extension: 'jpg',
          fileName: '123_foo_bar_baz_452.67EUR.jpg',
          filePath:
            '/data/user/0/io.cozy.flagship.mobile/cache/123_foo_bar_baz_45.67EUR2.jpg',
          fromFlagship: true,
          mimeType: 'image/jpeg',
          subject: null
        },
        name: '123_foo_bar_baz_452.67EUR.jpg',
        status: 0,
        type: 'image/jpeg'
      }
    ]

    expect(result).toEqual(expected)
  })

  it('should process iOS file correctly', () => {
    const result = _onReceiveFiles(iOSReceivedFileFixture)

    const expected: OsReceiveFile[] = [
      {
        file: {
          contentUri: null,
          extension: 'pdf',
          fileName: 'Carte_Alan.pdf',
          filePath:
            'file:///Users/anc/Library/Developer/CoreSimulator/Devices/AE73D485-F700-46F2-900B-713E046D6B51/data/Containers/Shared/AppGroup/7B75CC01-AE21-4949-9E2E-0DC1F63D0C15/Carte_Alan.pdf',
          fromFlagship: true,
          mimeType: 'application/pdf',
          text: null,
          weblink: null
        },
        name: 'Carte_Alan.pdf',
        status: 0,
        type: 'application/pdf'
      }
    ]

    expect(result).toEqual(expected)
  })

  it('should process iOS files correctly', () => {
    const result = _onReceiveFiles(iOSReceivedFileFixtures)

    const expected: OsReceiveFile[] = [
      {
        file: {
          contentUri: null,
          extension: 'pdf',
          fileName: 'Carte_Alan.pdf',
          filePath:
            'file:///Users/toto/Library/Developer/CoreSimulator/Devices/AE73D485-F700-46F2-900B-713E046D6B51/data/Containers/Shared/AppGroup/7B75CC01-AE21-4949-9E2E-0DC1F63D0C15/Carte_Alan.pdf',
          fromFlagship: true,
          mimeType: 'application/pdf',
          text: null,
          weblink: null
        },
        name: 'Carte_Alan.pdf',
        status: 0,
        type: 'application/pdf'
      },
      {
        file: {
          contentUri: null,
          extension: 'jpg',
          fileName: 'Carte_Alan2.jpg',
          filePath:
            'file:///Users/toto/Library/Developer/CoreSimulator/Devices/AE73D485-F700-46F2-900B-713E046D6B51/data/Containers/Shared/AppGroup/7B75CC01-AE21-4949-9E2E-0DC1F63D0C15/Carte_Alan2.jpg',
          fromFlagship: true,
          mimeType: 'image/jpeg',
          text: null,
          weblink: null
        },
        name: 'Carte_Alan2.jpg',
        status: 0,
        type: 'image/jpeg'
      }
    ]

    expect(result).toEqual(expected)
  })
})
