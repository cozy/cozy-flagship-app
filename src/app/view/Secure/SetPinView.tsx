import React, { useState } from 'react'
import {
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView
} from 'react-native'
import RnMaskInput from 'react-native-mask-input'

import { savePinCode } from '/app/domain/authorization/services/SecurityService'
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
import { palette } from '/ui/palette'
import { useI18n } from '/locales/i18n'
import { CozyTheme } from '/ui/CozyTheme/CozyTheme'

const SetPinViewSimple = (): JSX.Element => {
  const [step, setStep] = useState(1)
  const [firstInput, setFirstInput] = useState('')
  const [secondInput, setSecondInput] = useState('')
  const [error, setError] = useState('')
  const [passwordVisibility, togglePasswordVisibility] = useState(false)
  const handleFirstInputSubmit = (): void => {
    setStep(2)
  }
  const { t } = useI18n()

  const handleSecondInputSubmit = (): void => {
    if (secondInput === firstInput) {
      void savePinCode(secondInput)
    } else {
      setError(t('screens.SecureScreen.confirm_pin_error'))
    }
  }

  const isPasswordComplete = (password: string): boolean =>
    password.length === 4

  return (
    <Container>
      <Grid container direction="column" justifyContent="space-between">
        <Grid justifyContent="space-between"></Grid>

        {step === 1 && (
          <>
            <Grid alignItems="center" direction="column">
              <Typography
                variant="h4"
                style={{ maxWidth: 296, marginBottom: 24, textAlign: 'center' }}
              >
                {t('screens.SecureScreen.pinsave_step1_title')}
              </Typography>

              <Typography
                style={{ marginBottom: 24, textAlign: 'center' }}
                variant="body1"
              >
                {t('screens.SecureScreen.pinsave_step1_body')}
              </Typography>

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
                label={t('screens.lock.pin_label')}
                onSubmitEditing={handleFirstInputSubmit as () => void}
                returnKeyType="go"
                secureTextEntry={!passwordVisibility}
                value={firstInput}
                testID="pin-input"
              />
            </Grid>

            <Button
              onPress={handleFirstInputSubmit}
              disabled={!isPasswordComplete(firstInput)}
              testID="pin-next"
              label={t('screens.SecureScreen.pinsave_step1_cta')}
            />
          </>
        )}

        {step === 2 && (
          <>
            <Grid alignItems="center" direction="column">
              <Typography variant="h4">
                {t('screens.SecureScreen.pinsave_step2_title')}
              </Typography>

              <Typography
                style={{ marginBottom: 24, textAlign: 'center' }}
                variant="body2"
              >
                {t('screens.SecureScreen.pinsave_step2_body')}
              </Typography>

              <Tooltip title={error}>
                <TextField
                  endAdornment={
                    <IconButton
                      onPress={togglePasswordVisibility as () => void}
                    >
                      <Icon icon={!passwordVisibility ? EyeClosed : Eye} />
                    </IconButton>
                  }
                  inputComponent={RnMaskInput}
                  inputComponentProps={{
                    onChangeText: setSecondInput,
                    mask: [[/\d/], [/\d/], [/\d/], [/\d/]]
                  }}
                  keyboardType="numeric"
                  label={t('screens.lock.pin_label')}
                  onSubmitEditing={handleSecondInputSubmit as () => void}
                  returnKeyType="go"
                  secureTextEntry={!passwordVisibility}
                  value={secondInput}
                  testID="pin-confirm-input"
                />
              </Tooltip>
            </Grid>

            <Button
              onPress={handleSecondInputSubmit}
              disabled={!isPasswordComplete(secondInput)}
              label={t('screens.SecureScreen.pinsave_step2_cta')}
            />
          </>
        )}
      </Grid>
    </Container>
  )
}

export const SetPinView = (): JSX.Element => (
  <TouchableWithoutFeedback
    onPress={Keyboard.dismiss}
    style={{ backgroundColor: palette.Primary[600], height: '100%' }}
  >
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <CozyTheme variant="inverted">
        <SetPinViewSimple />
      </CozyTheme>
    </KeyboardAvoidingView>
  </TouchableWithoutFeedback>
)
