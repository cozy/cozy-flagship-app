import React, { useState, useEffect } from 'react'
import RnMaskInput from 'react-native-mask-input'

import {
  savePinCode,
  startPinCode
} from '/app/domain/authorization/services/SecurityService'
import { translation } from '/locales'
import { Container } from '/ui/Container'
import { Grid } from '/ui/Grid'
import { Tooltip } from '/ui/Tooltip'
import { Typography } from '/ui/Typography'
import { Button } from '/ui/Button'
import { Icon } from '/ui/Icon'
import { IconButton } from '/ui/IconButton'
import { Eye } from '/ui/Icons/Eye'
import { EyeClosed } from '/ui/Icons/EyeClosed'
import { TextField } from '/ui/TextField'

export const SetPinView = (): JSX.Element => {
  const [step, setStep] = useState(1)
  const [firstInput, setFirstInput] = useState('')
  const [secondInput, setSecondInput] = useState('')
  const [error, setError] = useState('')
  const [passwordVisibility, togglePasswordVisibility] = useState(false)

  useEffect(() => {
    void startPinCode()
  }, [])

  const handleFirstInputSubmit = (): void => {
    setStep(2)
  }

  const handleSecondInputSubmit = (): void => {
    if (secondInput === firstInput) {
      void savePinCode(secondInput)
    } else {
      setError(translation.screens.SecureScreen.confirm_pin_error)
    }
  }

  return (
    <Container>
      <Grid container direction="column" justifyContent="space-between">
        <Grid justifyContent="space-between"></Grid>

        {step === 1 && (
          <>
            <Grid alignItems="center" direction="column">
              <Typography variant="h4" color="secondary">
                {translation.screens.SecureScreen.pinsave_step1_title}
              </Typography>

              <Typography
                color="secondary"
                style={{ opacity: 0.64, marginBottom: 24, textAlign: 'center' }}
                variant="body2"
              >
                {translation.screens.SecureScreen.pinsave_step1_body}
              </Typography>
            </Grid>

            <TextField
              endAdornment={
                <IconButton onPress={togglePasswordVisibility as () => void}>
                  <Icon icon={!passwordVisibility ? EyeClosed : Eye} />
                </IconButton>
              }
              inputComponent={RnMaskInput}
              inputComponentProps={{
                onChangeText: setFirstInput,
                mask: [[/\d/], [/\d/], [/\d/], [/\d/]]
              }}
              keyboardType="numeric"
              label={translation.screens.lock.pin_label}
              onSubmitEditing={handleFirstInputSubmit as () => void}
              returnKeyType="go"
              secureTextEntry={!passwordVisibility}
              value={firstInput}
              testID="pin-input"
            />

            <Grid direction="column">
              <Button
                onPress={handleFirstInputSubmit}
                disabled={firstInput.length !== 4}
                testID="pin-next"
              >
                <Typography color="primary" variant="button">
                  {translation.screens.SecureScreen.pinsave_step1_cta}
                </Typography>
              </Button>
            </Grid>
          </>
        )}

        {step === 2 && (
          <>
            <Grid alignItems="center" direction="column">
              <Typography variant="h4" color="secondary">
                {translation.screens.SecureScreen.pinsave_step2_title}
              </Typography>

              <Typography
                color="secondary"
                style={{ opacity: 0.64, marginBottom: 24, textAlign: 'center' }}
                variant="body2"
              >
                {translation.screens.SecureScreen.pinsave_step2_body}
              </Typography>
            </Grid>

            <Tooltip title={error}>
              <TextField
                endAdornment={
                  <IconButton onPress={togglePasswordVisibility as () => void}>
                    <Icon icon={!passwordVisibility ? EyeClosed : Eye} />
                  </IconButton>
                }
                inputComponent={RnMaskInput}
                inputComponentProps={{
                  onChangeText: setSecondInput,
                  mask: [[/\d/], [/\d/], [/\d/], [/\d/]]
                }}
                keyboardType="numeric"
                label={translation.screens.lock.pin_label}
                onSubmitEditing={handleSecondInputSubmit as () => void}
                returnKeyType="go"
                secureTextEntry={!passwordVisibility}
                value={secondInput}
                testID="pin-confirm-input"
              />
            </Tooltip>

            <Grid direction="column">
              <Button onPress={handleSecondInputSubmit}>
                <Typography color="primary" variant="button">
                  {translation.screens.SecureScreen.pinsave_step2_cta}
                </Typography>
              </Button>
            </Grid>
          </>
        )}
      </Grid>
    </Container>
  )
}
