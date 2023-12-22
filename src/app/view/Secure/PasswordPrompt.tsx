import React from 'react'

import { usePasswordPrompt } from '/app/view/Secure/hooks/usePasswordPrompt'
import { PromptingPage } from '/components/templates/PromptingPage'
import { useI18n } from '/locales/i18n'

export const PasswordPrompt = (): JSX.Element => {
  const handleSetPassword = usePasswordPrompt()
  const { t } = useI18n()

  return (
    <PromptingPage
      title={t('screens.SecureScreen.passwordprompt_title')}
      body={t('screens.SecureScreen.passwordprompt_body')}
      button1={{
        label: t('screens.SecureScreen.passwordprompt_cta'),
        onPress: handleSetPassword
      }}
    />
  )
}
