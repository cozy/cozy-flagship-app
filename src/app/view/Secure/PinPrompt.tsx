import { RouteProp } from '@react-navigation/native'
import React, { useEffect } from 'react'

import { PromptingPage } from '/components/templates/PromptingPage'
import { navigate } from '/libs/RootNavigation'
import { routes } from '/constants/routes'
import { translation } from '/locales'
import { startPinCode } from '/app/domain/authorization/services/SecurityService'
import { devlog } from '/core/tools/env'

type RootStackParamList = Record<string, undefined | { onSuccess: () => void }>

interface PinPromptProps {
  route: RouteProp<RootStackParamList, 'pinPrompt'>
}

export const PinPrompt = (props: PinPromptProps): JSX.Element => {
  const handleSetPinCode = (): void => {
    navigate(routes.setPin, { onSuccess: props.route.params?.onSuccess })
  }

  const handleIgnorePinCode = (): void => {
    try {
      if (!props.route.params?.onSuccess)
        throw new Error('No onSuccess callback given to PinPrompt')
      props.route.params.onSuccess()
    } catch (error) {
      devlog(error)
      navigate(routes.home)
    }
  }

  useEffect(() => {
    void startPinCode()
  }, [])

  return (
    <PromptingPage
      title={translation.screens.SecureScreen.pinprompt_title}
      body={translation.screens.SecureScreen.pinprompt_body}
      button1={{
        label: translation.screens.SecureScreen.pinprompt_cta,
        onPress: handleSetPinCode
      }}
      button2={{
        label: translation.screens.SecureScreen.pinprompt_refusal,
        onPress: handleIgnorePinCode
      }}
    />
  )
}
