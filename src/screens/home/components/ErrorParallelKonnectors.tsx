import React from 'react'

import { Button } from '/ui/Button'
import { ConfirmDialog } from '/ui/CozyDialogs/ConfirmDialog'
import { Typography } from '/ui/Typography'
import { useI18n } from '/locales/i18n'

interface ErrorParallelKonnectorsProps {
  concurrentKonnector: string
  currentRunningKonnector: string
  onClose: () => void
}

export const ErrorParallelKonnectors = ({
  concurrentKonnector,
  currentRunningKonnector,
  onClose
}: ErrorParallelKonnectorsProps): JSX.Element | null => {
  const { t } = useI18n()

  return (
    <ConfirmDialog
      actions={
        <Button onPress={onClose} variant="secondary">
          <Typography color="textSecondary" variant="button">
            {t('konnectors.errorDoubleRun.button')}
          </Typography>
        </Button>
      }
      content={t('konnectors.errorDoubleRun.body', {
        running_konnector: currentRunningKonnector,
        concurrent_konnector: concurrentKonnector
      })}
      onClose={onClose}
      title={t('konnectors.errorDoubleRun.title')}
    />
  )
}
