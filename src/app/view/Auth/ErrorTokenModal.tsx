import React from 'react'
import { Trans } from 'react-i18next'

import { Button } from '/ui/Button'
import { ConfirmDialog } from '/ui/CozyDialogs/ConfirmDialog'
import { Typography } from '/ui/Typography'
import { useI18n } from '/locales/i18n'

interface ErrorTokenModalProps {
  onClose: () => void
  handleEmail: () => void
}

export const ErrorTokenModal = ({
  handleEmail,
  onClose
}: ErrorTokenModalProps): JSX.Element | null => {
  const { t } = useI18n()

  return (
    <ConfirmDialog
      actions={
        <Button onPress={onClose} variant="secondary">
          <Typography color="textSecondary" variant="button">
            {t('modals.ErrorToken.button')}
          </Typography>
        </Button>
      }
      content={
        <Typography>
          <Trans
            i18nKey="modals.ErrorToken.body"
            t={t}
            values={{ email: t('support.email') }}
            components={{
              linkTag: (
                <Typography
                  color="primary"
                  variant="link"
                  onPress={handleEmail}
                />
              )
            }}
          />
        </Typography>
      }
      onClose={onClose}
      title={t('modals.ErrorToken.title')}
    />
  )
}
