import React from 'react'
import RnMaskInput from 'react-native-mask-input'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback
} from 'react-native'

import { Button } from '/ui/Button'
import { Container } from '/ui/Container'
import { CozyCircle } from '/ui/Icons/CozyCircle'
import { Eye } from '/ui/Icons/Eye'
import { EyeClosed } from '/ui/Icons/EyeClosed'
import { FlagshipBars } from '/components/ui/FlagshipBars'
import { Grid } from '/ui/Grid'
import { Icon } from '/ui/Icon'
import { IconButton } from '/ui/IconButton'
import { Link } from '/ui/Link'
import { LockScreenProps, LockViewProps } from '/screens/lock/LockScreenTypes'
import { LogoutFlipped } from '/ui/Icons/LogoutFlipped'
import { TextField } from '/ui/TextField'
import { Tooltip } from '/ui/Tooltip'
import { Typography } from '/ui/Typography'
import { getBiometryIcon } from '/screens/lock/functions/lockScreenFunctions'
import { translation } from '/locales'
import { useLockScreenProps } from '/screens/lock/hooks/useLockScreen'
import { palette } from '/ui/palette'

const LockView = ({
  biometryEnabled,
  biometryType,
  fqdn,
  handleBiometry,
  handleInput,
  input,
  logout,
  mode,
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

        {biometryType && biometryEnabled ? (
          <IconButton onPress={handleBiometry}>
            <Icon icon={getBiometryIcon(biometryType)} />
          </IconButton>
        ) : null}
      </Grid>

      <Grid alignItems="center" direction="column">
        <Icon icon={CozyCircle} style={{ marginBottom: 14 }} />

        <Typography variant="h4" color="secondary">
          {mode === 'password' ? translation.screens.lock.title : null}
          {mode === 'PIN' ? translation.screens.lock.pin_title : null}
        </Typography>

        <Typography
          color="secondary"
          style={{ opacity: 0.64, marginBottom: 24 }}
          variant="body2"
        >
          {fqdn}
        </Typography>

        <Tooltip title={uiError}>
          {mode === 'password' ? (
            <TextField
              endAdornment={
                <IconButton onPress={togglePasswordVisibility}>
                  <Icon icon={!passwordVisibility ? EyeClosed : Eye} />
                </IconButton>
              }
              label={translation.screens.lock.password_label}
              onChangeText={handleInput}
              onSubmitEditing={tryUnlock}
              returnKeyType="go"
              secureTextEntry={!passwordVisibility}
              value={input}
            />
          ) : null}

          {mode === 'PIN' ? (
            <TextField
              endAdornment={
                <IconButton onPress={togglePasswordVisibility}>
                  <Icon icon={!passwordVisibility ? EyeClosed : Eye} />
                </IconButton>
              }
              inputComponent={RnMaskInput}
              inputComponentProps={{
                onChangeText: handleInput,
                mask: [[/\d/], [/\d/], [/\d/], [/\d/]]
              }}
              keyboardType="numeric"
              label={translation.screens.lock.pin_label}
              onSubmitEditing={tryUnlock}
              returnKeyType="go"
              secureTextEntry={!passwordVisibility}
              value={input}
            />
          ) : null}
        </Tooltip>

        <Link
          onPress={toggleMode}
          style={{ alignSelf: 'flex-start', marginVertical: 16 }}
        >
          <Typography variant="underline" color="secondary">
            {mode === 'PIN' ? translation.ui.buttons.forgotPin : null}

            {mode === 'password' ? translation.ui.buttons.forgotPassword : null}
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
  <>
    <FlagshipBars />

    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
      style={{ backgroundColor: palette.Primary[600], height: '100%' }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LockView {...useLockScreenProps(props.route?.params)} />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  </>
)
