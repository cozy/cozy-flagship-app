import { differenceInDays } from 'date-fns'

import { Q } from 'cozy-client'
import CozyClient from 'cozy-client'
import flag from 'cozy-flags'
import Minilog from 'cozy-minilog'

import { showLocalNotification } from '/libs/notifications/notifications'
import { t } from '/locales/i18n'
import { getData, storeData, StorageKeys } from '/libs/localStore/storage'
import { setGeolocationTracking } from '/app/domain/geolocation/services/tracking'

const MAX_DAYS_TO_CAPTURE_UNLIMITED = -1
const ONE_DAY = 24 * 60 * 60 * 1000

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
      StorageKeys.FirstTimeserie
    )

    if (firstTimeserieCachedLocally) {
      return firstTimeserieCachedLocally
    } else {
      const { data } = (await client.fetchQueryAndGetFromState({
        definition: Q('io.cozy.timeseries.geojson')
          .where({ _id: { $gt: null } })
          .select(['_id', 'startDate'])
          .indexFields(['startDate'])
          .sortBy([{ startDate: 'asc' }])
          .limitBy(1),
        options: {
          as: 'io.cozy.timeseries.geojson/firstTimeserie',
          fetchPolicy: CozyClient.fetchPolicies.olderThan(ONE_DAY)
        }
      })) as unknown as { data: FirstTimeserie[] }

      if (data.length === 0) return undefined

      const firstTimeserie = data[0]

      await storeData(StorageKeys.FirstTimeserie, firstTimeserie)

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

  const daysSinceFirstCapture = differenceInDays(
    new Date(),
    new Date(firstTimeserie.startDate)
  )

  return daysSinceFirstCapture > maxDaysToCapture
}

export const showQuotaExceededNotification = async (): Promise<void> => {
  const maxDaysToCapture = flag('coachco2.max-days-to-capture') as number | null

  if (
    isMaxDaysToCaptureInvalid(maxDaysToCapture) ||
    isMaxDaysToCaptureUnlimited(maxDaysToCapture)
  ) {
    return
  }

  await showLocalNotification({
    title: t('services.geolocationTracking.quotaExceededNotificationTitle'),
    body: t(
      'services.geolocationTracking.quotaExceededNotificationDescription',
      {
        days: maxDaysToCapture.toString()
      }
    ),
    data: {
      redirectLink: 'coachco2/'
    }
  })
}

export const checkGeolocationQuota = async (
  client: CozyClient
): Promise<void> => {
  const quotaExceeded = await isGeolocationQuotaExceeded(client)

  if (quotaExceeded) {
    log.debug('Geolocation quota exceeded')
    await setGeolocationTracking(false)
    await showQuotaExceededNotification()
  }
}
