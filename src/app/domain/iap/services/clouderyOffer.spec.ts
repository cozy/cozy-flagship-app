import { Platform } from 'react-native'

import { formatClouderyOfferUrlWithInAppPurchaseParams } from '/app/domain/iap/services/clouderyOffer'

describe('formatClouderyOfferUrlWithInAppPurchaseParams', () => {
  it('should set correct params', () => {
    Platform.OS = 'ios'
    const clouderyOfferString =
      'https://manager-dev.cozycloud.cc/cozy/instances/eff7568d-766b-4385-896b-3a4a4a410142/premium'

    const clouderyOfferUrl =
      formatClouderyOfferUrlWithInAppPurchaseParams(clouderyOfferString)

    expect(clouderyOfferUrl).toBe(
      'https://manager-dev.cozycloud.cc/cozy/instances/eff7568d-766b-4385-896b-3a4a4a410142/premium?iap_vendor=ios&iap_url=https%3A%2F%2Fiapflagship'
    )
  })
})
