import React from 'react'

import { PromptingPage } from '/components/templates/PromptingPage'
import { navigate } from '/libs/RootNavigation'
import { routes } from '/constants/routes'
import { translation } from '/locales'

export const PasswordPrompt = (): JSX.Element => {
  const handleSetPassword = (): void => {
    navigate(routes.setPassword)
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
