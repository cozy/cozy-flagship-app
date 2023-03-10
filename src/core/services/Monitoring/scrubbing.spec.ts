import { Breadcrumb, Event } from '@sentry/react-native'

import { scrubPhoneNumbers } from '/libs/monitoring/scrubbing'

jest.mock('/core/tools/env', () => ({
  devlog: jest.fn()
}))

describe('scrubPhoneNumbers', () => {
  it('tampers with events if a phone number is detected', () => {
    const event = {
      breadcrumbs: [{}],
      extra: {
        arguments: "Error 13: Can't open url: tel:(234)-555-1234, bailing out"
      },
      event_id: '0',
      message: "Error 13: Can't open url: tel:(234)-555-1234, bailing out"
    } as Event

    const expectedEvent = {
      breadcrumbs: [{}],
      extra: {
        arguments: "Error 13: Can't open url: tel:(***)-***-****, bailing out"
      },
      event_id: '0',
      message: "Error 13: Can't open url: tel:(***)-***-****, bailing out"
    } as Event

    expect(scrubPhoneNumbers(event)).toEqual(expectedEvent)
  })

  it('does not tamper with events if a phone number is not detected', () => {
    const event = { event_id: '0', message: "Can't open url: foo.bar" }
    const expectedEvent = { event_id: '0', message: "Can't open url: foo.bar" }

    expect(scrubPhoneNumbers(event)).toEqual(expectedEvent)
  })

  it('tampers with breadcrumbs if a phone number is detected', () => {
    const breadcrumb = {
      category: 'console',
      event_id: '0',
      data: {
        arguments: [
          "Error (+14): Can't open url: tel:+33 01 02 03 04 05, bailing out"
        ]
      },
      message:
        "Error (+14): Can't open url: tel:+33 01 02 03 04 05, bailing out"
    } as Breadcrumb

    const expectedBreadcrumb = {
      category: 'console',
      event_id: '0',
      data: {
        arguments: [
          "Error (+14): Can't open url: tel:+** ** ** ** ** **, bailing out"
        ]
      },
      message:
        "Error (+14): Can't open url: tel:+** ** ** ** ** **, bailing out"
    } as Breadcrumb

    expect(scrubPhoneNumbers(breadcrumb)).toEqual(expectedBreadcrumb)
  })

  it('does not tamper with breadcrumbs if a phone number is not detected', () => {
    const breadcrumb = {
      category: 'console',
      event_id: '0',
      data: { arguments: ["Can't open url: foo.bar"] },
      message: "Can't open url: foo.bar"
    } as Breadcrumb

    const expectedBreadcrumb = {
      category: 'console',
      event_id: '0',
      data: { arguments: ["Can't open url: foo.bar"] },
      message: "Can't open url: foo.bar"
    } as Breadcrumb

    expect(scrubPhoneNumbers(breadcrumb)).toEqual(expectedBreadcrumb)
  })
})
