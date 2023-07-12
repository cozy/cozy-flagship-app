import React from 'react'

import { Button } from '/ui/Button'
import { ConfirmDialog } from '/ui/CozyDialogs/ConfirmDialog'
import { Typography } from '/ui/Typography'
import { translation } from '/locales'
import { Link } from '/ui/Link'

interface ErrorTokenModalProps {
  onClose: () => void
  handleEmail: () => void
}

// This is a placeholder for the real translation function (react-i18next)
const translate = (
  text: string,
  placeholders: Record<string, JSX.Element>
): JSX.Element[] => {
  return text.split(/(\{\{.+?\}\})/g).map((part: string) => {
    if (part.startsWith('{{') && part.endsWith('}}')) {
      const placeholderKey = part.slice(2, -2)
      return placeholders[placeholderKey]
    } else {
      return <Typography key={part[0]}>{part}</Typography>
    }
  })
}

export const ErrorTokenModal = ({
  handleEmail,
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
    content={
      <Typography>
        {translate(translation.modals.ErrorToken.body, {
          email: (
            // Aligning a Pressable inside a Text component was harder than expected, using a hack for now
            // https://stackoverflow.com/questions/66590167/vertically-align-pressable-inside-a-text-component
            <Link onPress={handleEmail} style={{ flexDirection: 'row' }}>
              <Typography
                color="primary"
                variant="link"
                style={{
                  alignSelf: 'flex-end',
                  marginBottom: -4
                }}
              >
                {translation.support.email}
              </Typography>
            </Link>
          )
        })}
      </Typography>
    }
    onClose={onClose}
    title={translation.modals.ErrorToken.title}
  />
)
