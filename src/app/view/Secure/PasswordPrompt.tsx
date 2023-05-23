import { RouteProp } from '@react-navigation/native'
import React from 'react'

import { PromptingPage } from '/components/templates/PromptingPage'
import { navigate } from '/libs/RootNavigation'
import { routes } from '/constants/routes'
import { translation } from '/locales'
import { devlog } from '/core/tools/env'

type RootStackParamList = Record<string, undefined | { onSuccess: () => void }>

interface PasswordPromptProps {
  route: RouteProp<RootStackParamList, 'promptPassword'>
}

export const PasswordPrompt = (props: PasswordPromptProps): JSX.Element => {
  const handleSetPassword = (): void => {
    try {
      if (!props.route.params?.onSuccess)
        throw new Error('No onSuccess callback given to PinPrompt')
      navigate(routes.setPin, { onSuccess: props.route.params.onSuccess })
    } catch (error) {
      devlog(error)
      navigate(routes.setPin, { onSuccess: () => navigate(routes.home) })
    }
  }

  return (
    <PromptingPage
      title={translation.screens.SecureScreen.passwordprompt_title}
      body={translation.screens.SecureScreen.passwordprompt_body}
      button1={{
        label: translation.screens.SecureScreen.passwordprompt_cta,
        onPress: handleSetPassword
      }}
    />
  )
}
