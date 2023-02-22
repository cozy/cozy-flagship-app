import React from 'react'

import { Button } from '/ui/Button'
import { ConfirmDialog } from '/ui/CozyDialogs/ConfirmDialog'
import { Typography } from '/ui/Typography'
import { t } from '/core/tools/interpolate'
import { translation } from '/locales'

interface ErrorParallelKonnectorsProps {
  concurrentKonnector: string
  currentRunningKonnector: string
  onClose: () => void
}

export const ErrorParallelKonnectors = ({
  concurrentKonnector,
  currentRunningKonnector,
  onClose
}: ErrorParallelKonnectorsProps): JSX.Element | null => (
  <ConfirmDialog
    actions={
      <Button onPress={onClose} variant="secondary">
        <Typography color="textSecondary" variant="button">
          {translation.konnectors.errorDoubleRun.button}
        </Typography>
      </Button>
    }
    content={t(translation.konnectors.errorDoubleRun.body, {
      running_konnector: currentRunningKonnector,
      concurrent_konnector: concurrentKonnector
    })}
    onClose={onClose}
    title={translation.konnectors.errorDoubleRun.title}
  />
)
