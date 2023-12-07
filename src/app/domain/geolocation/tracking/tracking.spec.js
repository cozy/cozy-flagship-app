import { getActivities } from './storage'

import {
  createDataBatch,
  filterNonHeadingPointsAfterStillActivity,
  getFilteredActivities,
  createNewStartPoint
} from '/app/domain/geolocation/tracking/tracking'

jest.mock('/app/domain/geolocation/tracking/storage', () => ({
  getActivities: jest.fn()
}))

jest.mock('/app/domain/geolocation/tracking/user', () => ({
  getOrCreateId: jest.fn()
}))
jest.mock('/app/domain/geolocation/helpers/index', () => ({
  ...jest.requireActual('/app/domain/geolocation/helpers/index'),
  Log: jest.fn()
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
  it('should filter the activities to remove consecutive stationary activities', async () => {
    const activity1 = { data: { cycling: true, walking: false, ts: 1 } }
    const activity2 = { data: { walking: false, stationary: true, ts: 2 } }
    const activity3 = { data: { walking: false, stationary: true, ts: 3 } }
    const activity4 = { data: { walking: true, stationary: false, ts: 4 } }

    getActivities.mockResolvedValueOnce([
      activity1,
      activity2,
      activity3,
      activity4
    ])

    const activities = await getFilteredActivities({ beforeTs: 5 })
    expect(activities).toEqual([activity1, activity2, activity4])
  })

  it('should only keep the most recent stationary activities', async () => {
    const activity1 = { data: { stationary: true, ts: 1 } }
    const activity2 = { data: { stationary: true, ts: 2 } }
    const activity3 = { data: { stationary: true, ts: 3 } }

    getActivities.mockResolvedValueOnce([activity1, activity2, activity3])

    const activities = await getFilteredActivities({ beforeTs: 4 })
    expect(activities).toEqual([activity1])
  })

  it('should keep the only activity', async () => {
    const activity1 = { data: { cycling: true, walking: false, ts: 1 } }
    getActivities.mockResolvedValueOnce([activity1])

    const activities = await getFilteredActivities({ beforeTs: 5 })
    expect(activities).toEqual([activity1])
  })
})

describe('filterNonHeadingPointsAfterStillActivity', () => {
  it('handles empty locations and activities', () => {
    const result = filterNonHeadingPointsAfterStillActivity([], [])
    expect(result).toEqual([])
  })

  it('filters out locations without heading after the last still activity', () => {
    const locations = [
      { timestamp: '2023-06-01', coords: { heading: 10 } },
      { timestamp: '2023-06-02', coords: { heading: -1 } },
      { timestamp: '2023-06-03', coords: { heading: 5 } }
    ]
    const activities = [{ data: { stationary: true, ts: '2023-06-02' } }]

    const expectedLocations = [
      { timestamp: '2023-06-01', coords: { heading: 10 } },
      { timestamp: '2023-06-03', coords: { heading: 5 } }
    ]
    const result = filterNonHeadingPointsAfterStillActivity(
      locations,
      activities
    )
    expect(result).toEqual(expectedLocations)
  })
})

describe('shouldCreateNewStartPoint', () => {
  it('should not create new start point when distance is too small', () => {
    const prevPoint = { coords: { latitude: 48.8566, longitude: 2.3522 } }
    const nextPoint = { coords: { latitude: 48.85669, longitude: 2.3522 } }
    expect(shouldCreateNewStartPoint(prevPoint, nextPoint)).toEqual(false)
  })
  it('should not create new start point when distance is too high', () => {
    const prevPoint = { coords: { latitude: 48.8566, longitude: 2.3522 } }
    const nextPoint = { coords: { latitude: 48.94652, longitude: 2.3522 } }
    expect(shouldCreateNewStartPoint(prevPoint, nextPoint)).toEqual(false)
  })
  it('should create new start point when distance is in range', () => {
    const prevPoint = { coords: { latitude: 48.8566, longitude: 2.3522 } }
    const nextPoint = { coords: { latitude: 48.8575, longitude: 2.3522 } }
    expect(shouldCreateNewStartPoint(prevPoint, nextPoint)).toEqual(true)
  })
})

describe('createNewStartPoint', () => {
  it('should create a new point based on next point timestamp and previous point coordinates', () => {
    const prevPoint = {
      coords: { latitude: 51.502681, longitude: -0.137321 },
      timestamp: '2023-12-01T10:00:00'
    }
    const nextPoint = {
      coords: { latitude: 51.502781, longitude: -0.138321 },
      timestamp: '2023-12-01T12:00:00'
    }

    let newPoint = createNewStartPoint(prevPoint, nextPoint)
    expect(newPoint.coords).toEqual(prevPoint.coords)
    expect(new Date(newPoint.timestamp).getTime()).toBeGreaterThan(
      new Date(prevPoint.timestamp).getTime()
    )
    expect(new Date(newPoint.timestamp).getTime()).toBeLessThan(
      new Date(nextPoint.timestamp).getTime()
    )
  })
})
