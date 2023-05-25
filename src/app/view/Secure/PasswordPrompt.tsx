import { RouteProp } from '@react-navigation/native'
import React from 'react'

import { usePasswordPrompt } from '/app/view/Secure/hooks/usePasswordPrompt'
import { PromptingPage } from '/components/templates/PromptingPage'
import { translation } from '/locales'

type RootStackParamList = Record<string, { onSuccess: () => void }>

interface PasswordPromptProps {
  route: RouteProp<RootStackParamList, 'pinPrompt'>
}

export const PasswordPrompt = ({ route }: PasswordPromptProps): JSX.Element => {
  const handleSetPassword = usePasswordPrompt(route.params.onSuccess)

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
