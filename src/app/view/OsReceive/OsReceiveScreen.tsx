import React from 'react'
import { StyleProp, TextStyle } from 'react-native'
import { SvgXml } from 'react-native-svg'

import { Icon } from '/ui/Icon'
import { IconButton } from '/ui/IconButton'
import { Container } from '/ui/Container'
import { Grid } from '/ui/Grid'
import { Button } from '/ui/Button'
import { getIconTable } from '/libs/functions/iconTable'
import { useI18n } from '/locales/i18n'
import { Radio } from '/ui/Radio'
import { Typography } from '/ui/Typography'
import {
  useAppsForUpload,
  useFilesToUpload
} from '/app/view/OsReceive/OsReceiveState'
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubHeader
} from '/ui/List'
import { ArrowLeft } from '/ui/Icons/ArrowLeft'
import { palette } from '/ui/palette'
import { Divider } from '/ui/Divider'
import { useOsReceiveScreenLogic } from '/app/view/OsReceive/OsReceiveScreen.logic'

import { osReceiveScreenStyles } from '/app/view/OsReceive/OsReceiveScreen.styles'

import { FileDuotone } from '/ui/Icons/FileDuotone'

export const OsReceiveScreen = (): JSX.Element | null => {
  const filesToUpload = useFilesToUpload()
  const appsForUpload = useAppsForUpload()
  const { t } = useI18n()
  const {
    selectedOption,
    setSelectedOption,
    canProceed,
    proceedToWebview,
    onClose,
    hasAppsForUpload
  } = useOsReceiveScreenLogic()

  const hasFilesToUpload = filesToUpload.length > 0
  const isSingleFile = filesToUpload.length === 1
  const isMultipleFiles = filesToUpload.length > 1
  const shouldRender =
    hasFilesToUpload && appsForUpload && appsForUpload.length > 0

  if (!shouldRender) return null

  return (
    <Container style={osReceiveScreenStyles.page}>
      <Grid container direction="column" justifyContent="space-between">
        <Grid alignItems="center">
          <IconButton
            onPress={onClose}
            style={osReceiveScreenStyles.goBackButton}
          >
            <Icon
              size={16}
              icon={ArrowLeft}
              color={palette.light.text.secondary}
            />
          </IconButton>

          {isMultipleFiles ? (
            <Typography variant="h4">
              {t('services.osReceive.nElementsTitle', {
                n: filesToUpload.length
              })}
            </Typography>
          ) : null}
        </Grid>

        <Grid direction="column">
          {isSingleFile ? (
            <Typography
              variant="h5"
              style={
                osReceiveScreenStyles.singleFileTitle as StyleProp<TextStyle>
              }
            >
              {filesToUpload[0].name}
            </Typography>
          ) : null}

          <List
            subheader={
              <ListSubHeader>
                <Typography
                  // @ts-expect-error There is an issue with the palette secondary color
                  color={palette.light.text.secondary}
                  variant="subtitle2"
                >
                  {t('services.osReceive.documentType')}
                </Typography>
              </ListSubHeader>
            }
          >
            {appsForUpload.map((app, index) => (
              <React.Fragment key={app.slug}>
                <ListItem
                  button={!app.reasonDisabled && app.slug !== selectedOption}
                  onClick={(): void => setSelectedOption(app.slug)}
                  key={app.slug}
                  style={{
                    ...(app.reasonDisabled
                      ? osReceiveScreenStyles.disabled
                      : {})
                  }}
                >
                  <ListItemIcon style={osReceiveScreenStyles.appIcon}>
                    {((): JSX.Element => {
                      const iconFromCache =
                        app.slug !== 'drive' && getIconTable()[app.slug]?.xml

                      return iconFromCache ? (
                        <SvgXml xml={iconFromCache} width={24} height={24} />
                      ) : (
                        <Icon
                          icon={FileDuotone}
                          size={24}
                          color={palette.light.text.secondary}
                        />
                      )
                    })()}
                  </ListItemIcon>

                  <ListItemText>
                    <Typography style={osReceiveScreenStyles.appName}>
                      {app.name}
                    </Typography>

                    {app.reasonDisabled && (
                      <Typography variant="caption">
                        {app.reasonDisabled}
                      </Typography>
                    )}
                  </ListItemText>

                  <Radio selected={selectedOption === app.slug} />
                </ListItem>

                {index !== appsForUpload.length - 1 && (
                  <Divider leftOffset={64} />
                )}
              </React.Fragment>
            ))}
          </List>
        </Grid>

        <Button
          variant="secondary"
          onPress={proceedToWebview}
          disabled={canProceed()}
        >
          <Typography color="secondary" variant="button">
            {t(
              hasAppsForUpload()
                ? 'services.osReceive.submit'
                : 'services.osReceive.abort'
            )}
          </Typography>
        </Button>
      </Grid>
    </Container>
  )
}
