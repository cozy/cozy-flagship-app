import { getActivities } from './storage'

import {
  createDataBatch,
  getFilteredActivities
} from '/app/domain/geolocation/tracking/tracking'

jest.mock('/app/domain/geolocation/tracking/storage', () => ({
  getActivities: jest.fn()
}))

const maxBatchSize = 5

describe('createDataBatch', () => {
  it('slices the array correctly', () => {
    const locations = Array.from({ length: 10 }, (_, i) => i + 1) // [1, 2, ..., 10]

    expect(createDataBatch(locations, 0, maxBatchSize)).toEqual([1, 2, 3, 4, 5])
    expect(createDataBatch(locations, 1, maxBatchSize)).toEqual([
      6, 7, 8, 9, 10
    ])
  })

  it('returns an empty array when locations is empty', () => {
    const locations = []
    expect(createDataBatch(locations, 0, maxBatchSize)).toEqual([])
  })

  it('returns correct slice when nRun goes beyond bounds', () => {
    const locations = [1, 2]

    expect(createDataBatch(locations, 0, maxBatchSize)).toEqual([1, 2])
    expect(createDataBatch(locations, 1, maxBatchSize)).toEqual([]) // No data for this batch
  })
})

describe('get activities', () => {
  it('should filter the activities to keep distinct modes', async () => {
    const activity1 = { data: { cycling: true, walking: false, ts: 1 } }
    const activity2 = { data: { walking: true, cycling: false, ts: 2 } }
    const activity3 = { data: { walking: true, cycling: false, ts: 3 } }
    const activity4 = { data: { walking: true, cycling: false, ts: 4 } }

    getActivities.mockResolvedValueOnce([
      activity1,
      activity2,
      activity3,
      activity4
    ])

    const activities = await getFilteredActivities({ beforeTs: 5 })
    expect(activities).toEqual([activity1, activity2])
  })

  it('should return all activities when they change', async () => {
    const activity1 = { data: { cycling: true, walking: false, ts: 1 } }
    const activity2 = {
      data: { walking: false, cycling: false, in_vehicle: true, ts: 2 }
    }
    const activity3 = { data: { walking: true, cycling: false, ts: 3 } }

    getActivities.mockResolvedValueOnce([activity1, activity2, activity3])

    const activities = await getFilteredActivities({ beforeTs: 5 })
    expect(activities).toEqual([activity1, activity2, activity3])
  })

  it('should keep the only activity', async () => {
    const activity1 = { data: { cycling: true, walking: false, ts: 1 } }
    getActivities.mockResolvedValueOnce([activity1])

    const activities = await getFilteredActivities({ beforeTs: 5 })
    expect(activities).toEqual([activity1])
  })
})
