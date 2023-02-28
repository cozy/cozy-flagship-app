import { useEffect, useState } from 'react'

import { getOnboardingPartner, OnboardingPartner } from './onboardingPartner'

export interface UseInitializationHook {
  isInitialized: boolean
  onboardingPartner: OnboardingPartner | undefined
}

export const useInstallReferrer = (): UseInitializationHook => {
  const [onboardingPartner, setOnboardingPartner] = useState<
    OnboardingPartner | undefined
  >(undefined)

  useEffect(function getReferral() {
    void getOnboardingPartner().then(onboardingPartner => {
      return setOnboardingPartner(onboardingPartner)
    })
  }, [])

  return {
    isInitialized: onboardingPartner != undefined,
    onboardingPartner
  }
}
