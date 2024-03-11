/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { Subscription } from 'react-native-iap'

export {
  clearTransactionIOS,
  ProrationModesAndroid,
  requestSubscription
} from 'react-native-iap'

export type {
  Subscription,
  SubscriptionAndroid,
  SubscriptionOffer
} from 'react-native-iap'

export { initConnection } from 'react-native-iap'

export const getSubscriptions = ({
  skus
}: {
  skus: string[]
}): Promise<Subscription[]> => {
  return Promise.resolve([])
}

export function withIAPContext(Component: React.ComponentType) {
  return function WrapperComponent(
    props: JSX.IntrinsicAttributes
  ): JSX.Element {
    return <Component {...props} />
  }
}

export const useIAP = (): useIAPResult => {
  const subscriptions: Subscription[] = []
  const getSubscriptions = ({ skus }: { skus: string[] }): Promise<void> => {
    return Promise.resolve()
  }
  return { subscriptions, getSubscriptions }
}

interface useIAPResult {
  subscriptions: Subscription[]
  getSubscriptions: ({ skus }: { skus: string[] }) => Promise<void>
}
