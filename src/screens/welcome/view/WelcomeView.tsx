import React from 'react'

import { Button } from '/ui/Button'
import { translation } from '/locales'
import { Container } from '/ui/Container'
import { Grid } from '/ui/Grid'
import { Icon } from '/ui/Icon'
import { Typography } from '/ui/Typography'
import { Cloud } from '/ui/Icons/Cloud'

interface WelcomeViewProps {
  onContinue: () => void
}

export const WelcomeView = ({ onContinue }: WelcomeViewProps): JSX.Element => (
  <Container>
    <Grid container direction="column" justifyContent="space-between">
      <Grid
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ flexGrow: 1 }}
      >
        <Icon icon={Cloud} style={{ marginBottom: 20 }} />

        <Typography variant="h2" color="secondary" style={{ marginBottom: 16 }}>
          {translation.screens.welcome.title}
        </Typography>

        <Typography
          color="secondary"
          variant="body2"
          style={{ maxWidth: 296, textAlign: 'center' }}
        >
          {translation.screens.welcome.body}
        </Typography>
      </Grid>

      <Button onPress={onContinue}>
        <Typography color="primary" variant="button">
          {translation.screens.welcome.button}
        </Typography>
      </Button>
    </Grid>
  </Container>
)
