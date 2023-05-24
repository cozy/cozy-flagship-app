import React from 'react'

import { usePasswordPrompt } from '/app/view/Secure/hooks/usePasswordPrompt'
import { PromptingPage } from '/components/templates/PromptingPage'
import { translation } from '/locales'

export interface PasswordPromptProps {
  onSuccess: () => void
}

export const PasswordPrompt = ({
  onSuccess
}: PasswordPromptProps): JSX.Element => {
  const handleSetPassword = usePasswordPrompt(onSuccess)

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
