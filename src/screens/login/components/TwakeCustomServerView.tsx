import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { BackHandler, StyleSheet } from 'react-native'
import DeviceInfo from 'react-native-device-info'

import { BlockedCozyError, fetchRegistrationDetails } from 'cozy-client'
import Minilog from 'cozy-minilog'

import { routes } from '/constants/routes'
import strings from '/constants/strings.json'
import { sanitizeUrlInput } from '/app/domain/authentication/utils/cozySanitizeUrl'
import { getErrorMessage } from '/libs/functions/getErrorMessage'
import { navigate } from '/libs/RootNavigation'
import { t } from '/locales/i18n'
import { getColors } from '/ui/colors'
import { Container } from '/ui/Container'
import { Button } from '/ui/Button'
import { Grid } from '/ui/Grid'
import { Icon } from '/ui/Icon'
import { IconButton } from '/ui/IconButton'
import { Left } from '/ui/Icons/Left'
import { Link } from '/ui/Link'
import { TextField } from '/ui/TextField'
import { Typography } from '/ui/Typography'

const log = Minilog('TwakeCustomServerView')

const colors = getColors()

const getVersion = (): string => {
  const appVersion = DeviceInfo.getVersion()
  const appBuild = DeviceInfo.getBuildNumber()

  return `${appVersion} (${appBuild})`
}

interface TwakeCustomServerViewProps {
  openTos: () => void
  close: () => void
  setInstanceData: setInstanceData
  startOidcOauthNoCode: startOidcOauthNoCode
}

export const TwakeCustomServerView = ({
  openTos,
  close,
  setInstanceData,
  startOidcOauthNoCode
}: TwakeCustomServerViewProps): JSX.Element => {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | undefined>()

  const version = useMemo(() => getVersion(), [])

  const handleBackPress = useCallback(() => {
    close()
    return true
  }, [close])

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackPress)

    return () =>
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress)
  }, [handleBackPress])

  const handleInput = (input: string): void => {
    setInput(input)
  }

  const handleLogin = async (): Promise<void> => {
    setError(undefined)
    try {
      const sanitizedInput = sanitizeUrlInput(input)

      const details = await fetchRegistrationDetails(new URL(sanitizedInput))

      if (details.isOIDC) {
        startOidcOauthNoCode(details.rootUrl.origin)
      } else {
        const url = new URL(details.rootUrl)
        const checkInstanceData = {
          instance: url.origin,
          fqdn: url.host
        }
        setInstanceData({ ...checkInstanceData })
      }
    } catch (e: unknown) {
      const errorMessage = getErrorMessage(e)
      log.error(
        `Something went wrong while trying to login to Custom Server: ${errorMessage}`
      )
      if (e instanceof BlockedCozyError) {
        navigate(routes.error, {
          type: strings.errorScreens.cozyBlocked
        })
        return
      }
      setError(getErrorMessage(e))
    }
  }

  return (
    <Container transparent={false}>
      <Grid container direction="column" justifyContent="space-between">
        <Grid alignItems="flex-start" direction="column">
          <Grid alignItems="flex-start" direction="column">
            <IconButton onPress={handleBackPress}>
              <Icon icon={Left} color={colors.primaryColor} />
            </IconButton>
          </Grid>
          <Grid alignItems="center" direction="column" style={styles.loginGrid}>
            <Typography variant="h2" color="textPrimary">
              {t('screens.companyServer.title')}
            </Typography>
            <Typography
              variant="body2"
              color="textPrimary"
              style={{
                textAlign: 'center'
              }}
            >
              {t('screens.companyServer.body')}
            </Typography>
            <TextField
              style={styles.urlField}
              label={t('screens.companyServer.textFieldLabel')}
              onChangeText={handleInput}
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onSubmitEditing={handleLogin}
              returnKeyType="go"
              value={input}
              autoCapitalize="none"
              autoFocus={false}
              placeholder="https://claude.mycozy.cloud"
              placeholderTextColor={colors.actionColorDisabled}
              inputMode="url"
            />
            {error && (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            )}
          </Grid>
        </Grid>

        <Grid alignItems="center" direction="column" style={styles.footerGrid}>
          <Button
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onPress={handleLogin}
            variant="primary"
            label={t('screens.companyServer.buttonLogin')}
            style={styles.loginButton}
          />
          <Typography variant="caption">
            {t('screens.welcomeTwake.byContinuingYourAgreeingToOur')}
          </Typography>
          <Link onPress={openTos}>
            <Typography variant="caption" color="primary">
              {t('screens.welcomeTwake.privacyPolicy')}
            </Typography>
          </Link>
          <Typography variant="caption">{version}</Typography>
        </Grid>
      </Grid>
    </Container>
  )
}

const styles = StyleSheet.create({
  loginGrid: {
    marginTop: 30
  },
  footerGrid: {
    gap: 0
  },
  urlField: {
    marginTop: 30
  },
  loginButton: {
    marginBottom: 30
  }
})
