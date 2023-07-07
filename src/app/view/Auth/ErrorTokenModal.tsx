import React from 'react'

import { Button } from '/ui/Button'
import { ConfirmDialog } from '/ui/CozyDialogs/ConfirmDialog'
import { Typography } from '/ui/Typography'
import { translation } from '/locales'

interface ErrorTokenModalProps {
  onClose: () => void
}

export const ErrorTokenModal = ({
  onClose
}: ErrorTokenModalProps): JSX.Element | null => (
  <ConfirmDialog
    actions={
      <Button onPress={onClose} variant="secondary">
        <Typography color="textSecondary" variant="button">
          {translation.modals.ErrorToken.button}
        </Typography>
      </Button>
    }
    content={translation.modals.ErrorToken.body}
    onClose={onClose}
    title={translation.modals.ErrorToken.title}
  />
)
