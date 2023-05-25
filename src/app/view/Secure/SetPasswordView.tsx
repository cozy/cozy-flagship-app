import { RouteProp } from '@react-navigation/native'
import React from 'react'

import { usePasswordState } from './hooks/usePasswordState'

import { usePasswordService } from '/app/view/Secure/hooks/usePasswordProps'
import { OnboardingPasswordView } from '/screens/login/components/OnboardingPasswordView'
import { Container } from '/ui/Container'

type RootStackParamList = Record<string, { onSuccess: () => void }>

interface SetPasswordViewProps {
  route: RouteProp<RootStackParamList, 'pinPrompt'>
}

export const SetPasswordView = ({
  route
}: SetPasswordViewProps): JSX.Element => {
  const props = usePasswordService(route.params.onSuccess)
  const state = usePasswordState()

  return props ? (
    <OnboardingPasswordView {...props} {...state} />
  ) : (
    <Container />
  )
}
