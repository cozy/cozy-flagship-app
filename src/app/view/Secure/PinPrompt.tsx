import React from 'react'

import { routes } from '/constants/routes'
import { navigate } from '/libs/RootNavigation'
import { Container } from '/ui/Container'
import { Grid } from '/ui/Grid'
import { Icon } from '/ui/Icon'
import { CozyCircle } from '/ui/Icons/CozyCircle'
import { Typography } from '/ui/Typography'
import { Button } from '/ui/Button'
import { translation } from '/locales'

export const PinPrompt = (): JSX.Element => {
  const handleSetPinCode = (): void => {
    navigate(routes.setPin)
  }

  const handleIgnorePinCode = (): void => {
    navigate(routes.home)
  }

  return (
    <Container>
      <Grid container direction="column" justifyContent="space-between">
        <Grid justifyContent="space-between"></Grid>
        <Grid alignItems="center" direction="column">
          <Icon icon={CozyCircle} style={{ marginBottom: 14 }} />

          <Typography variant="h4" color="secondary">
            {translation.screens.SecureScreen.pinprompt_title}
          </Typography>

          <Typography
            color="secondary"
            style={{ opacity: 0.64, marginBottom: 24, textAlign: 'center' }}
            variant="body2"
          >
            {translation.screens.SecureScreen.pinprompt_body}
          </Typography>
        </Grid>

        <Grid direction="column">
          <Button onPress={handleSetPinCode}>
            <Typography color="primary" variant="button">
              {translation.screens.SecureScreen.pinprompt_cta}
            </Typography>
          </Button>

          <Button variant="secondary" onPress={handleIgnorePinCode}>
            <Typography color="secondary" variant="button">
              {translation.screens.SecureScreen.pinprompt_refusal}
            </Typography>
          </Button>
        </Grid>
      </Grid>
    </Container>
  )
}
