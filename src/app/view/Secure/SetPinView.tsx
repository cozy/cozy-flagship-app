import { RouteProp } from '@react-navigation/native'
import React, { useState } from 'react'
import {
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView
} from 'react-native'
import RnMaskInput from 'react-native-mask-input'
import { FullWindowOverlay } from 'react-native-screens'

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
import { ConditionalWrapper } from '/components/ConditionalWrapper'
import { palette } from '/ui/palette'
import { useI18n } from '/locales/i18n'

const SetPinViewSimple = ({
  onSuccess
}: {
  onSuccess: () => void
}): JSX.Element => {
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
      void savePinCode(secondInput, onSuccess)
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
                color="secondary"
                style={{ maxWidth: 296, marginBottom: 24, textAlign: 'center' }}
              >
                {t('screens.SecureScreen.pinsave_step1_title')}
              </Typography>

              <Typography
                color="secondary"
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
            >
              <Typography
                color={!isPasswordComplete(firstInput) ? 'disabled' : 'primary'}
                variant="button"
              >
                {t('screens.SecureScreen.pinsave_step1_cta')}
              </Typography>
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <Grid alignItems="center" direction="column">
              <Typography variant="h4" color="secondary">
                {t('screens.SecureScreen.pinsave_step2_title')}
              </Typography>

              <Typography
                color="secondary"
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
            >
              <Typography
                color={
                  !isPasswordComplete(secondInput) ? 'disabled' : 'primary'
                }
                variant="button"
              >
                {t('screens.SecureScreen.pinsave_step2_cta')}
              </Typography>
            </Button>
          </>
        )}
      </Grid>
    </Container>
  )
}

type RootStackParamList = Record<string, { onSuccess: () => void }>

interface SetPinProps {
  route: RouteProp<RootStackParamList, 'pinView'>
}

export const SetPinView = (props: SetPinProps): JSX.Element => (
  <ConditionalWrapper
    condition={Platform.OS === 'ios'}
    wrapper={(children): JSX.Element => (
      <FullWindowOverlay>{children}</FullWindowOverlay>
    )}
  >
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
      style={{ backgroundColor: palette.Primary[600], height: '100%' }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SetPinViewSimple {...props} onSuccess={props.route.params.onSuccess} />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  </ConditionalWrapper>
)
