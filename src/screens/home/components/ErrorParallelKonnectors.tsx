import React from 'react'

import { Button } from '/ui/Button'
import { ConfirmDialog } from '/ui/CozyDialogs/ConfirmDialog'
import { Typography } from '/ui/Typography'
import { t } from '/core/tools/interpolate'
import { translation } from '/locales'

interface ErrorParallelConnectorsProps {
  concurrentConnector: string
  currentRunningConnector: string
  onClose: () => void
}

export const ErrorParallelConnectors = ({
  concurrentConnector,
  currentRunningConnector,
  onClose
}: ErrorParallelConnectorsProps): JSX.Element | null => (
  <ConfirmDialog
    actions={
      <Button onPress={onClose} variant="secondary">
        <Typography color="textSecondary" variant="button">
          {translation.connectors.errorDoubleRun.button}
        </Typography>
      </Button>
    }
    content={t(translation.connectors.errorDoubleRun.body, {
      running_connector: currentRunningConnector,
      concurrent_connector: concurrentConnector
    })}
    onClose={onClose}
    title={translation.connectors.errorDoubleRun.title}
  />
)
