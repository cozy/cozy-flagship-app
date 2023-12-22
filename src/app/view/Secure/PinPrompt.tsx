import React from 'react'

import { PromptingPage } from '/components/templates/PromptingPage'
import { usePinPrompt } from '/app/view/Secure/hooks/usePinPrompt'
import { useI18n } from '/locales/i18n'
import { CozyTheme } from '/ui/CozyTheme/CozyTheme'

export const PinPrompt = (): JSX.Element => {
  const { handleSetPinCode, handleIgnorePinCode } = usePinPrompt()
  const { t } = useI18n()

  return (
    <CozyTheme variant="inverted">
      <PromptingPage
        title={t('screens.SecureScreen.pinprompt_title')}
        body={t('screens.SecureScreen.pinprompt_body')}
        button1={{
          label: t('screens.SecureScreen.pinprompt_cta'),
          onPress: handleSetPinCode
        }}
        button2={{
          label: t('screens.SecureScreen.pinprompt_refusal'),
          onPress: handleIgnorePinCode
        }}
      />
    </CozyTheme>
  )
}
