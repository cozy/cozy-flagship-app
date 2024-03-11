import { Platform } from 'react-native'

import Minilog from 'cozy-minilog'

import { getSubscriptions as iapGetSubscriptions } from '/app/domain/iap/services/iapModule'
import { getErrorMessage } from '/libs/functions/getErrorMessage'

const log = Minilog('💳 Available IAP Offers')

const IOS_OFFERS = [
  'price_2024_standard_monthly_01',
  'price_2024_premium_monthly_01'
]
const ANDROID_OFFERS = ['2024_standard_01', '2024_premium_01']
export const SKUS = Platform.OS === 'ios' ? IOS_OFFERS : ANDROID_OFFERS

export const isIapAvailable = async (): Promise<boolean> => {
  try {
    const subscriptions = await iapGetSubscriptions({ skus: SKUS })
    return subscriptions.length > 0
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error)
    log.error(
      `Error while geting Subscriptions in isIapAvailable: ${errorMessage}`
    )
    return false
  }
}
