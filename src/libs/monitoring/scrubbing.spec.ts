import { scrubPhoneNumbers } from '/libs/monitoring/scrubbing'

describe('scrubPhoneNumbers', () => {
  it('tampers with messages if a phone number is detected', () => {
    const event = { event_id: '0', message: 'tel:1234567890' }
    const expectedEvent = { event_id: '0', message: 'tel:XXXXXXXXXX' }

    expect(scrubPhoneNumbers(event)).toEqual(expectedEvent)
  })

  it('does not temper with messages if a phone number is not detected', () => {
    const event = { event_id: '0', message: 'foo:bar' }
    const expectedEvent = { event_id: '0', message: 'foo:bar' }

    expect(scrubPhoneNumbers(event)).toEqual(expectedEvent)
  })
})
