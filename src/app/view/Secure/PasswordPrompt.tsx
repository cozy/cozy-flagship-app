import React from 'react'

import { routes } from '/constants/routes'
import { navigate } from '/libs/RootNavigation'
import { Container } from '/ui/Container'
import { Grid } from '/ui/Grid'
import { Typography } from '/ui/Typography'
import { Button } from '/ui/Button'
import { Icon } from '/ui/Icon'
import { CozyCircle } from '/ui/Icons/CozyCircle'
import { translation } from '/locales'

export const PasswordPrompt = (): JSX.Element => {
  const handleSetPassword = (): void => {
    navigate(routes.setPassword)
  }

  return (
    <Container>
      <Grid container direction="column" justifyContent="space-between">
        <Grid justifyContent="space-between"></Grid>
        <Grid alignItems="center" direction="column">
          <Icon icon={CozyCircle} style={{ marginBottom: 14 }} />

          <Typography variant="h4" color="secondary">
            {translation.screens.SecureScreen.passwordprompt_title}
          </Typography>

          <Typography
            color="secondary"
            style={{ opacity: 0.64, marginBottom: 24, textAlign: 'center' }}
            variant="body2"
          >
            {translation.screens.SecureScreen.passwordprompt_body}
          </Typography>
        </Grid>

        <Grid direction="column">
          <Button onPress={handleSetPassword}>
            <Typography color="primary" variant="button">
              {translation.screens.SecureScreen.passwordprompt_cta}
            </Typography>
          </Button>
        </Grid>
      </Grid>
    </Container>
  )
}
