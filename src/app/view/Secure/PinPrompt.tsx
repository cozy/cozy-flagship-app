import { RouteProp } from '@react-navigation/native'
import React from 'react'

import { PromptingPage } from '/components/templates/PromptingPage'
import { translation } from '/locales'
import { usePinPrompt } from '/app/view/Secure/hooks/usePinPrompt'

type RootStackParamList = Record<string, undefined | { onSuccess: () => void }>

interface PinPromptProps {
  route: RouteProp<RootStackParamList, 'pinPrompt'>
}

export const PinPrompt = (props: PinPromptProps): JSX.Element => {
  const { handleSetPinCode, handleIgnorePinCode } = usePinPrompt(
    props.route.params?.onSuccess
  )

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
