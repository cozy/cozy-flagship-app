import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { SvgXml } from 'react-native-svg'

import { getColorScheme } from '/app/theme/colorScheme'
import strings from '/constants/strings.json'
import { getErrorMessage } from '/libs/functions/getErrorMessage'
import { openUrlInAppBrowser } from '/libs/functions/urlHelpers'
import { t } from '/locales/i18n'
import { useHomeStateContext } from '/screens/home/HomeStateProvider'
import { getClouderyUrls } from '/screens/login/cloudery-env/clouderyEnv'
import {
  isOidcOnboardingStartCallback,
  processOIDC
} from '/screens/login/components/functions/oidc'
import { TwakeCustomServerView } from '/screens/login/components/TwakeCustomServerView'
import { Button } from '/ui/Button'
import { getColors } from '/ui/colors'
import { Container } from '/ui/Container'
import { Grid } from '/ui/Grid'
import { Link } from '/ui/Link'
import { getTwakeLogoSvg } from '/ui/Logo/logo'
import { Typography } from '/ui/Typography'

const colors = getColors()
const colorScheme = getColorScheme()

interface TwakeWelcomeViewProps {
  setError: setErrorCallback
  startOidcOAuth: startOidcOAuth
  startOidcOnboarding: startOidcOnboarding
  setInstanceData: setInstanceData
}

export const TwakeWelcomeView = ({
  setError,
  startOidcOAuth,
  startOidcOnboarding,
  setInstanceData
}: TwakeWelcomeViewProps): JSX.Element => {
  const { setOnboardedRedirection } = useHomeStateContext()
  const [isCustomServer, setIsCustomServer] = useState(false)

  const onLogin = async (): Promise<void> => {
    try {
      const clouderyUrl = await getClouderyUrls()

      const oidcResult = await processOIDC({ url: clouderyUrl.loginUrl }, true)

      if (isOidcOnboardingStartCallback(oidcResult)) {
        void startOidcOnboarding(oidcResult.onboardUrl, oidcResult.code)
      } else {
        setOnboardedRedirection(oidcResult.defaultRedirection ?? '')
        void startOidcOAuth(oidcResult.fqdn, oidcResult.code)
      }
    } catch (error: unknown) {
      if (error !== 'USER_CANCELED') {
        // @ts-expect-error error is always a valid type here
        setError(getErrorMessage(error), error)
      }
    }
  }

  const onRegister = async (): Promise<void> => {
    try {
      const clouderyUrl = await getClouderyUrls()

      const url = clouderyUrl.isOnboardingPartner
        ? clouderyUrl.loginUrl
        : clouderyUrl.signinUrl

      const oidcResult = await processOIDC({ url: url }, true)

      if (isOidcOnboardingStartCallback(oidcResult)) {
        void startOidcOnboarding(oidcResult.onboardUrl, oidcResult.code)
      } else {
        setOnboardedRedirection(oidcResult.defaultRedirection ?? '')
        void startOidcOAuth(oidcResult.fqdn, oidcResult.code)
      }
    } catch (error: unknown) {
      if (error !== 'USER_CANCELED') {
        // @ts-expect-error error is always a valid type here
        setError(getErrorMessage(error), error)
      }
    }
  }

  const openOnPremise = (): void => {
    setIsCustomServer(true)
  }

  const openTos = (): void => {
    openUrlInAppBrowser(strings.twake.privacyUrl)
  }

  if (isCustomServer) {
    return (
      <TwakeCustomServerView
        close={(): void => setIsCustomServer(false)}
        openTos={openTos}
        setInstanceData={setInstanceData}
      />
    )
  }

  return (
    <ThemedGradiant>
      <Container transparent={true}>
        <Grid container direction="column" justifyContent="space-between">
          <Grid alignItems="center" direction="column"></Grid>
          <Grid alignItems="center" direction="column">
            <SvgXml xml={getTwakeLogoSvg()} />
            <Typography
              variant="h2"
              color="textPrimary"
              style={{
                marginTop: 10,
                marginBottom: 0
              }}
            >
              {t('screens.welcomeTwake.title')}
            </Typography>
            <Typography
              variant="body2"
              color="textPrimary"
              style={{
                textAlign: 'center',
                marginLeft: 46,
                marginRight: 46,
                marginTop: 16,
                marginBottom: 16
              }}
            >
              {t('screens.welcomeTwake.body')}
            </Typography>
            <Button
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onPress={onLogin}
              variant="primary"
              label={t('screens.welcomeTwake.buttonLogin')}
            />
            <Button
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onPress={onRegister}
              variant="secondary"
              textColor={colors.primaryColor}
              label={t('screens.welcomeTwake.buttonSignin')}
            />
            <Link onPress={openOnPremise} style={styles.useYourCompanyLink}>
              <Typography variant="underline" color="primary">
                {t('screens.welcomeTwake.useYourCompanyServer')}
              </Typography>
            </Link>
          </Grid>

          <Grid
            alignItems="center"
            direction="column"
            style={styles.footerGrid}
          >
            <Typography variant="caption">
              {t('screens.welcomeTwake.byContinuingYourAgreeingToOur')}
            </Typography>
            <Link onPress={openTos}>
              <Typography variant="caption" color="primary">
                {t('screens.welcomeTwake.privacyPolicy')}
              </Typography>
            </Link>
          </Grid>
        </Grid>
      </Container>
    </ThemedGradiant>
  )
}

interface ThemedGradiantProps {
  children: JSX.Element
}

const ThemedGradiant = ({ children }: ThemedGradiantProps): JSX.Element => {
  if (colorScheme !== 'light') {
    return (
      <View
        style={{
          backgroundColor: colors.paperBackgroundColor
        }}
      >
        {children}
      </View>
    )
  }

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      locations={[0, 0.436, 1]}
      colors={['#feeed6', '#f5d4f5', '#cee6ff']}
      style={styles.linearGradient}
    >
      {children}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  useYourCompanyLink: {
    marginTop: 20
  },
  footerGrid: {
    gap: 0
  },
  linearGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  }
})
