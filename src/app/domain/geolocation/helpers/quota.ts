import { differenceInCalendarDays } from 'date-fns'

import { Q } from 'cozy-client'
import CozyClient from 'cozy-client'
import flag from 'cozy-flags'
import Minilog from 'cozy-minilog'

import {
  getData,
  storeData,
  CozyPersistedStorageKeys
} from '/libs/localStore/storage'
import { setGeolocationTracking } from '/app/domain/geolocation/services/tracking'

const MAX_DAYS_TO_CAPTURE_UNLIMITED = -1

const log = Minilog('📍 Geolocation')

export interface FirstTimeserie {
  id: string
  _id: string
  type: string
  startDate: string
}

const isMaxDaysToCaptureInvalid = (
  maxDaysToCapture: number | null
): maxDaysToCapture is null => {
  return typeof maxDaysToCapture !== 'number'
}

const isMaxDaysToCaptureUnlimited = (maxDaysToCapture: number): boolean => {
  return maxDaysToCapture === MAX_DAYS_TO_CAPTURE_UNLIMITED
}

const getFirstTimeserie = async (
  client: CozyClient
): Promise<FirstTimeserie | undefined> => {
  try {
    const firstTimeserieCachedLocally = await getData<FirstTimeserie>(
      CozyPersistedStorageKeys.FirstTimeserie
    )

    if (firstTimeserieCachedLocally) {
      return firstTimeserieCachedLocally
    } else {
      const { data } = (await client.query(
        Q('io.cozy.timeseries.geojson')
          .where({ startDate: { $gt: null } })
          .select(['_id', 'startDate'])
          .indexFields(['startDate'])
          .sortBy([{ startDate: 'asc' }])
          .limitBy(1)
      )) as unknown as { data: FirstTimeserie[] }

      if (data.length === 0) return undefined

      const firstTimeserie = data[0]

      await storeData(CozyPersistedStorageKeys.FirstTimeserie, firstTimeserie)

      return firstTimeserie
    }
  } catch (error) {
    log.warn('Failed to get or fetch first timeserie', error)
    return undefined
  }
}

export const isGeolocationQuotaExceeded = async (
  client: CozyClient
): Promise<boolean> => {
  const maxDaysToCapture = flag('coachco2.max-days-to-capture') as number | null

  if (
    isMaxDaysToCaptureInvalid(maxDaysToCapture) ||
    isMaxDaysToCaptureUnlimited(maxDaysToCapture)
  ) {
    return false
  }

  const firstTimeserie = await getFirstTimeserie(client)

  if (!firstTimeserie) return false

  const daysSinceFirstCapture = differenceInCalendarDays(
    new Date(),
    new Date(firstTimeserie.startDate)
  )

  const remainingDays = maxDaysToCapture - daysSinceFirstCapture

  return remainingDays <= 0
}

export const checkGeolocationQuota = async (
  client: CozyClient
): Promise<void> => {
  const quotaExceeded = await isGeolocationQuotaExceeded(client)

  if (quotaExceeded) {
    log.debug('Geolocation quota exceeded')
    await setGeolocationTracking(false)
  }
}
