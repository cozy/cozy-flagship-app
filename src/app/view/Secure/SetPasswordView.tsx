import React from 'react'

import { usePasswordState } from './hooks/usePasswordState'

import { usePasswordService } from '/app/view/Secure/hooks/usePasswordProps'
import { OnboardingPasswordView } from '/screens/login/components/OnboardingPasswordView'
import { Container } from '/ui/Container'

export const SetPasswordView = (): JSX.Element => {
  const props = usePasswordService()
  const state = usePasswordState()

  return props ? (
    <OnboardingPasswordView {...props} {...state} />
  ) : (
    <Container />
  )
}
