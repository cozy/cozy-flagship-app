import { differenceInDays } from 'date-fns'

import { Q } from 'cozy-client'
import CozyClient from 'cozy-client'
import flag from 'cozy-flags'

import { showLocalNotification } from '/libs/notifications/notifications'
import { t } from '/locales/i18n'
import { getData, storeData, StorageKeys } from '/libs/localStore/storage'

const MAX_DAYS_TO_CAPTURE_UNLIMITED = -1
const ONE_DAY = 24 * 60 * 60 * 1000

export interface FirstTimeserie {
  id: string
  _id: string
  type: string
  startDate: string
}

export const isGeolocationQuotaExceeded = async (
  client: CozyClient
): Promise<boolean> => {
  const maxDaysToCapture = flag('coachco2.max-days-to-capture') as number | null

  if (
    typeof maxDaysToCapture !== 'number' ||
    maxDaysToCapture === MAX_DAYS_TO_CAPTURE_UNLIMITED
  ) {
    return false
  }

  let firstTimeserie

  try {
    const firstTimeserieCachedLocally = await getData<FirstTimeserie>(
      StorageKeys.FirstTimeserie
    )

    if (firstTimeserieCachedLocally) {
      firstTimeserie = firstTimeserieCachedLocally
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

      if (data.length === 0) return false

      firstTimeserie = data[0]

      await storeData(StorageKeys.FirstTimeserie, firstTimeserie)
    }
  } catch (error) {
    return false
  }

  const daysSinceFirstCapture = differenceInDays(
    new Date(),
    new Date(firstTimeserie.startDate)
  )

  return daysSinceFirstCapture > maxDaysToCapture
}

export const showQuotaExceededNotification = async (): Promise<void> => {
  const maxDaysToCapture = flag('coachco2.max-days-to-capture') as number | null

  if (typeof maxDaysToCapture !== 'number') {
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
