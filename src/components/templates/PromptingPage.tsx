import React from 'react'

import { Container } from '/ui/Container'
import { Grid } from '/ui/Grid'
import { Icon } from '/ui/Icon'
import { Typography } from '/ui/Typography'
import { Button } from '/ui/Button'
import { Security } from '/ui/Icons/Security'

interface PromptingPageProps {
  icon?: () => JSX.Element
  title: string
  body: string
  button1: {
    label: string
    onPress: () => void
  }
  button2?: {
    label: string
    onPress: () => void
  }
}

export const PromptingPage = ({
  icon,
  title,
  body,
  button1,
  button2
}: PromptingPageProps): JSX.Element => (
  <Container>
    <Grid container direction="column" justifyContent="space-between">
      <Grid justifyContent="space-between"></Grid>
      <Grid alignItems="center" direction="column">
        <Icon icon={icon ?? Security} style={{ marginBottom: 14 }} />

        <Typography
          variant="h4"
          color="secondary"
          style={{ marginBottom: 24, maxWidth: 296, textAlign: 'center' }}
        >
          {title}
        </Typography>

        <Typography
          color="secondary"
          style={{ maxWidth: 296, textAlign: 'center' }}
          variant="body1"
        >
          {body}
        </Typography>
      </Grid>

      <Grid direction="column">
        <Button onPress={button1.onPress} style={{ marginBottom: 8 }}>
          <Typography color="primary" variant="button">
            {button1.label}
          </Typography>
        </Button>

        {button2 && (
          <Button variant="secondary" onPress={button2.onPress}>
            <Typography color="secondary" variant="button">
              {button2.label}
            </Typography>
          </Button>
        )}
      </Grid>
    </Grid>
  </Container>
)
