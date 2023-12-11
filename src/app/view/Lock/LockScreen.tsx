import React from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback
} from 'react-native'
import RnMaskInput from 'react-native-mask-input'
import { FullWindowOverlay } from 'react-native-screens'

import { routes } from '/constants/routes'
import { navigationRef } from '/libs/RootNavigation'
import { Button } from '/ui/Button'
import { ConditionalWrapper } from '/components/ConditionalWrapper'
import { ConfirmDialog } from '/ui/CozyDialogs/ConfirmDialog'
import { Container } from '/ui/Container'
import { CozyCircle } from '/ui/Icons/CozyCircle'
import { Eye } from '/ui/Icons/Eye'
import { EyeClosed } from '/ui/Icons/EyeClosed'
import { Grid } from '/ui/Grid'
import { Icon } from '/ui/Icon'
import { IconButton } from '/ui/IconButton'
import { Link } from '/ui/Link'
import { LockScreenBars } from '/app/view/Lock/LockScreenBars'
import { LockViewProps, LockScreenProps } from '/app/view/Lock/LockScreenTypes'
import { LogoutFlipped } from '/ui/Icons/LogoutFlipped'
import { TextField } from '/ui/TextField'
import { Tooltip } from '/ui/Tooltip'
import { Typography } from '/ui/Typography'
import { getBiometryIcon } from '/app/domain/authorization/services/LockScreenService'
import { palette } from '/ui/palette'
import { useLockScreenProps } from '/app/view/Lock/useLockScreen'
import { useI18n } from '/locales/i18n'

const LockView = ({
  biometryEnabled,
  biometryType,
  fqdn,
  handleBiometry,
  handleInput,
  hasLogoutDialog,
  input,
  logout,
  mode,
  passwordVisibility,
  toggleLogoutDialog,
  toggleMode,
  togglePasswordVisibility,
  tryUnlock,
  uiError
}: LockViewProps): JSX.Element => {
  const { t } = useI18n()

  return (
    <Container>
      {hasLogoutDialog && (
        <ConfirmDialog
          actions={
            <>
              <Button
                onPress={toggleLogoutDialog}
                label={t('logout_dialog.cancel')}
              />

              <Button
                onPress={logout}
                variant="secondary"
                label={t('logout_dialog.confirm')}
              />
            </>
          }
          content={t('logout_dialog.content')}
          onClose={toggleLogoutDialog}
          title={t('logout_dialog.title')}
        />
      )}

      <Grid container direction="column" justifyContent="space-between">
        <Grid justifyContent="space-between">
          <IconButton onPress={toggleLogoutDialog}>
            <Icon icon={LogoutFlipped} />
          </IconButton>

          {biometryType && biometryEnabled ? (
            <IconButton onPress={(): void => void handleBiometry()}>
              <Icon icon={getBiometryIcon(biometryType)} />
            </IconButton>
          ) : null}
        </Grid>

        <Grid alignItems="center" direction="column">
          <Icon icon={CozyCircle} style={{ marginBottom: 14 }} />

          <Typography variant="h4" color="secondary">
            {mode === 'password' ? t('screens.lock.title') : null}
            {mode === 'PIN' ? t('screens.lock.pin_title') : null}
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
                label={t('screens.lock.password_label')}
                onChangeText={handleInput}
                onSubmitEditing={tryUnlock}
                returnKeyType="go"
                secureTextEntry={!passwordVisibility}
                value={input}
                autoCapitalize="none"
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
                label={t('screens.lock.pin_label')}
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
            <Typography color="textSecondary" variant="underline">
              {mode === 'PIN' ? t('ui.buttons.forgotPin') : null}

              {mode === 'password' ? t('ui.buttons.forgotPassword') : null}
            </Typography>
          </Link>
        </Grid>

        <Grid direction="column">
          <Button onPress={tryUnlock} label={t('ui.buttons.unlock')} />
        </Grid>
      </Grid>
    </Container>
  )
}

export const LockScreen = (props: LockScreenProps): React.ReactNode => {
  const currentRouteName = navigationRef.current?.getCurrentRoute()?.name ?? ''

  return (
    <ConditionalWrapper
      condition={Platform.OS === 'ios' && currentRouteName === routes.lock}
      wrapper={(children): JSX.Element => (
        <FullWindowOverlay>{children}</FullWindowOverlay>
      )}
    >
      <>
        <LockScreenBars />

        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          style={{ backgroundColor: palette.Primary[600], height: '100%' }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <LockView {...useLockScreenProps(props)} />
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </>
    </ConditionalWrapper>
  )
}
