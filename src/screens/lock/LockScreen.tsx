import React from 'react'

import { Button } from '/ui/Button'
import { LockScreenProps, LockViewProps } from '/screens/lock/LockScreenTypes'
import { Container } from '/ui/Container'
import { CozyCircle } from '/ui/Icons/CozyCircle'
import { Eye } from '/ui/Icons/Eye'
import { EyeClosed } from '/ui/Icons/EyeClosed'
import { Fingerprint } from '/ui/Icons/Fingerprint'
import { Grid } from '/ui/Grid'
import { Icon } from '/ui/Icon'
import { IconButton } from '/ui/IconButton'
import { Link } from '/ui/Link'
import { LogoutFlipped } from '/ui/Icons/LogoutFlipped'
import { TextField } from '/ui/TextField'
import { Tooltip } from '/ui/Tooltip'
import { Typography } from '/ui/Typography'
import { translation } from '/locales'
import { useLockScreenProps } from '/screens/lock/hooks/useLockScreen'

const LockView = ({
  fqdn,
  handleInput,
  input,
  logout,
  passwordVisibility,
  toggleMode,
  togglePasswordVisibility,
  tryUnlock,
  uiError
}: LockViewProps): JSX.Element => (
  <Container>
    <Grid container direction="column" justifyContent="space-between">
      <Grid justifyContent="space-between">
        <IconButton onPress={logout}>
          <Icon icon={LogoutFlipped} />
        </IconButton>

        <IconButton>
          <Icon icon={Fingerprint} />
        </IconButton>
      </Grid>

      <Grid alignItems="center" direction="column">
        <Icon icon={CozyCircle} style={{ marginBottom: 14 }} />

        <Typography variant="h4" color="secondary">
          {translation.screens.lock.title}
        </Typography>

        <Typography
          variant="body2"
          color="secondary"
          style={{ opacity: 0.64, marginBottom: 24 }}
        >
          {fqdn}
        </Typography>

        <Tooltip title={uiError}>
          <TextField
            label={translation.screens.lock.password_label}
            onChangeText={handleInput}
            secureTextEntry={!passwordVisibility}
            value={input}
            variant="outlined"
            returnKeyType="go"
            onSubmitEditing={tryUnlock}
            endAdornment={
              <IconButton onPress={togglePasswordVisibility}>
                <Icon icon={!passwordVisibility ? EyeClosed : Eye} />
              </IconButton>
            }
          />
        </Tooltip>

        <Link
          style={{ alignSelf: 'flex-start', marginVertical: 16 }}
          onPress={toggleMode}
        >
          <Typography variant="underline" color="secondary">
            {translation.ui.buttons.usePIN}
          </Typography>
        </Link>
      </Grid>

      <Grid direction="column">
        <Button onPress={tryUnlock}>
          <Typography variant="button">
            {translation.ui.buttons.unlock}
          </Typography>
        </Button>
      </Grid>
    </Grid>
  </Container>
)

export const LockScreen = (props: LockScreenProps): JSX.Element => (
  <LockView {...useLockScreenProps(props.route?.params)} />
)
