import React, { useEffect } from 'react'

import { PromptingPage } from '/components/templates/PromptingPage'
import { navigate } from '/libs/RootNavigation'
import { routes } from '/constants/routes'
import { translation } from '/locales'
import { startPinCode } from '/app/domain/authorization/services/SecurityService'

export const PinPrompt = (): JSX.Element => {
  const handleSetPinCode = (): void => {
    navigate(routes.setPin)
  }

  const handleIgnorePinCode = (): void => {
    navigate(routes.home)
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
