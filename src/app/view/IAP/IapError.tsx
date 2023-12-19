import React from 'react'

import { FlagshipUI } from 'cozy-intent'

import { ScreenIndexes, useFlagshipUI } from '/app/view/FlagshipUI'
import { PromptingPage } from '/components/templates/PromptingPage'
import { useI18n } from '/locales/i18n'
import { Error } from '/ui/Icons/Error'
import { CozyTheme } from '/ui/CozyTheme/CozyTheme'

interface IapErrorProps {
  tryAgain: () => void
  backToOffers: () => void
}

const defaultFlagshipUI: FlagshipUI = {
  bottomTheme: 'dark',
  topTheme: 'dark'
}

export const IapError = ({
  tryAgain,
  backToOffers
}: IapErrorProps): JSX.Element => {
  const { t } = useI18n()

  useFlagshipUI(
    'ClouderyOfferError',
    ScreenIndexes.CLOUDERY_OFFER + 1,
    defaultFlagshipUI
  )

  return (
    <CozyTheme variant="normal">
      <PromptingPage
        title={t('screens.clouderyOffer.error.title')}
        icon={Error}
        body=""
        button1={{
          label: t('screens.clouderyOffer.error.tryAgain'),
          onPress: tryAgain
        }}
        button2={{
          label: t('screens.clouderyOffer.error.backToOffers'),
          onPress: backToOffers
        }}
      />
    </CozyTheme>
  )
}
