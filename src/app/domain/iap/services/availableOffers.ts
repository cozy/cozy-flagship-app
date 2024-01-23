import { Platform } from 'react-native'

const IOS_OFFERS = [
  'price_2024_standard_monthly_01',
  'price_2024_premium_monthly_01'
]
const ANDROID_OFFERS = ['2024_standard_01', '2024_premium_01']
export const SKUS = Platform.OS === 'ios' ? IOS_OFFERS : ANDROID_OFFERS
