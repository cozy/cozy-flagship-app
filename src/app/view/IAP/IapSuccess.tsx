import React from 'react'

import { FlagshipUI } from 'cozy-intent'

import { ScreenIndexes, useFlagshipUI } from '/app/view/FlagshipUI'
import { PromptingPage } from '/components/templates/PromptingPage'
import { useI18n } from '/locales/i18n'
import { Success } from '/ui/Icons/Success'
import { CozyTheme } from '/ui/CozyTheme/CozyTheme'

interface IapSuccessProps {
  hidePopup: () => void
}

const defaultFlagshipUI: FlagshipUI = {
  bottomTheme: 'dark',
  topTheme: 'dark'
}

export const IapSuccess = ({ hidePopup }: IapSuccessProps): JSX.Element => {
  const { t } = useI18n()

  useFlagshipUI(
    'ClouderyOfferSuccess',
    ScreenIndexes.CLOUDERY_OFFER + 1,
    defaultFlagshipUI
  )

  return (
    <CozyTheme variant="normal">
      <PromptingPage
        title={t('screens.clouderyOffer.success.title')}
        icon={Success}
        body={t('screens.clouderyOffer.success.body')}
        button1={{
          label: t('screens.clouderyOffer.success.close'),
          onPress: hidePopup
        }}
      />
    </CozyTheme>
  )
}
