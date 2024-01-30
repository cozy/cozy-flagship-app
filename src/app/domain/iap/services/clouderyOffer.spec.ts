import { Platform } from 'react-native'
import { Subscription } from 'react-native-iap'

import {
  formatClouderyOfferUrlWithInAppPurchaseParams,
  formatOffers
} from '/app/domain/iap/services/clouderyOffer'

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

describe('formatOffers', () => {
  it('should flatten and subset Android offers', () => {
    const offersParam = formatOffers(androidSubscriptionsExample)

    expect(offersParam).toBe(
      JSON.stringify([
        {
          productId: 'test_comfort',
          title: 'Test Confort',
          subscriptionPeriod: 'MONTH',
          basePlanId: 'test-comfort-monthly',
          currency: 'EUR',
          price: '3590000',
          localizedPrice: '€3.59'
        },
        {
          productId: 'test_comfort',
          title: 'Test Confort',
          subscriptionPeriod: 'YEAR',
          basePlanId: 'test-confort-yearly',
          currency: 'EUR',
          price: '42990000',
          localizedPrice: '€42.99'
        },
        {
          productId: 'test_super_comfort',
          title: 'Test Super Confort',
          subscriptionPeriod: 'MONTH',
          basePlanId: 'test-super-comfort-monthly',
          currency: 'EUR',
          price: '11990000',
          localizedPrice: '€11.99'
        }
      ])
    )
  })

  it('should flatten and subset iOS offers', () => {
    const offersParam = formatOffers(iosSubscriptionsExample)

    expect(offersParam).toBe(
      JSON.stringify([
        {
          productId: 'test_super_comfort_monthly',
          title: 'Test super confort mensuel',
          subscriptionPeriod: 'MONTH',
          currency: 'EUR',
          price: '10',
          localizedPrice: '10,00 €'
        },
        {
          productId: 'test_comfort_monthly',
          title: 'Test Confort Mensuel',
          subscriptionPeriod: 'MONTH',
          currency: 'EUR',
          price: '2.99',
          localizedPrice: '2,99 €'
        }
      ])
    )
  })
})

const androidSubscriptionsExample = [
  {
    subscriptionOfferDetails: [
      {
        pricingPhases: {
          pricingPhaseList: [
            {
              recurrenceMode: 1,
              priceAmountMicros: '3590000',
              billingCycleCount: 0,
              billingPeriod: 'P1M',
              priceCurrencyCode: 'EUR',
              formattedPrice: '€3.59'
            }
          ]
        },
        offerToken: 'SOME_OFFER_TOKEN_1',
        offerTags: ['cozy'],
        offerId: null,
        basePlanId: 'test-comfort-monthly'
      },
      {
        pricingPhases: {
          pricingPhaseList: [
            {
              recurrenceMode: 1,
              priceAmountMicros: '42990000',
              billingCycleCount: 0,
              billingPeriod: 'P1Y',
              priceCurrencyCode: 'EUR',
              formattedPrice: '€42.99'
            }
          ]
        },
        offerToken: 'SOME_OFFER_TOKEN_2',
        offerTags: ['cozy'],
        offerId: null,
        basePlanId: 'test-confort-yearly'
      }
    ],
    name: 'Test Confort',
    productType: 'subs',
    description: 'Mise à jour 2.',
    title: 'Test Confort (Cloud Personnel Cozy)',
    productId: 'test_comfort',
    platform: 'android'
  },
  {
    subscriptionOfferDetails: [
      {
        pricingPhases: {
          pricingPhaseList: [
            {
              recurrenceMode: 1,
              priceAmountMicros: '11990000',
              billingCycleCount: 0,
              billingPeriod: 'P1M',
              priceCurrencyCode: 'EUR',
              formattedPrice: '€11.99'
            }
          ]
        },
        offerToken: 'SOME_OFFER_TOKEN_2',
        offerTags: ['cozy'],
        offerId: null,
        basePlanId: 'test-super-comfort-monthly'
      }
    ],
    name: 'Test Super Confort',
    productType: 'subs',
    description: 'Mise à jour.',
    title: 'Test Super Confort (Cloud Personnel Cozy)',
    productId: 'test_super_comfort',
    platform: 'android'
  }
] as Subscription[]

const iosSubscriptionsExample = [
  {
    discounts: [],
    introductoryPriceNumberOfPeriodsIOS: '',
    description: 'Juste pour les tests.',
    introductoryPriceAsAmountIOS: '',
    productId: 'test_super_comfort_monthly',
    subscriptionPeriodUnitIOS: 'MONTH',
    countryCode: 'FRA',
    subscriptionPeriodNumberIOS: '1',
    title: 'Test super confort mensuel',
    introductoryPriceSubscriptionPeriodIOS: '',
    currency: 'EUR',
    introductoryPricePaymentModeIOS: '',
    price: '10',
    localizedPrice: '10,00 €',
    type: 'subs',
    introductoryPrice: '',
    platform: 'ios'
  },
  {
    introductoryPriceSubscriptionPeriodIOS: '',
    title: 'Test Confort Mensuel',
    introductoryPrice: '',
    introductoryPriceNumberOfPeriodsIOS: '',
    discounts: [],
    subscriptionPeriodNumberIOS: '1',
    countryCode: 'FRA',
    description: "Abonnement confort mensuel dans l'env de test",
    subscriptionPeriodUnitIOS: 'MONTH',
    productId: 'test_comfort_monthly',
    currency: 'EUR',
    introductoryPricePaymentModeIOS: '',
    price: '2.99',
    localizedPrice: '2,99 €',
    type: 'subs',
    introductoryPriceAsAmountIOS: '',
    platform: 'ios'
  }
] as Subscription[]
