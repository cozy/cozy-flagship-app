import React from 'react'
import { StyleProp, TextStyle } from 'react-native'
import { SvgXml } from 'react-native-svg'

import { FlagshipUI } from 'cozy-intent'

import { OsReceiveFile } from '/app/domain/osReceive/models/OsReceiveState'
import { AppForUpload } from '/app/domain/osReceive/models/OsReceiveCozyApp'
import { ScreenIndexes, useFlagshipUI } from '/app/view/FlagshipUI'
import { Icon } from '/ui/Icon'
import { Container } from '/ui/Container'
import { Grid } from '/ui/Grid'
import { Button } from '/ui/Button'
import { getIconTable } from '/libs/functions/iconTable'
import { useI18n } from '/locales/i18n'
import { Radio } from '/ui/Radio'
import { Typography } from '/ui/Typography'
import {
  useAppsForUpload,
  useFilesQueueStatus,
  useFilesToUpload
} from '/app/view/OsReceive/state/OsReceiveState'
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubHeader
} from '/ui/List'
import { Divider } from '/ui/Divider'
import { useOsReceiveScreenLogic } from '/app/view/OsReceive/hooks/useOsReceiveScreen'

import { osReceiveScreenStyles } from '/app/view/OsReceive/OsReceiveScreen.styles'

import { useCozyTheme } from '/ui/CozyTheme/CozyTheme'
import { FileDuotone } from '/ui/Icons/FileDuotone'
import { FileThumbnail } from '/ui/ImageThumbnail'

const defaultFlagshipUI: FlagshipUI = {
  bottomTheme: 'dark',
  topTheme: 'dark'
}

export const OsReceiveScreen = (): JSX.Element | null => {
  const filesToUpload = useFilesToUpload()
  const { hasAllFilesQueued } = useFilesQueueStatus()
  const appsForUpload = useAppsForUpload()

  const hasFilesToUpload = filesToUpload.length > 0
  const shouldRender =
    (hasFilesToUpload && appsForUpload && appsForUpload.length > 0) ||
    hasAllFilesQueued

  if (!shouldRender) return null

  return (
    <OsReceiveScreenView
      filesToUpload={filesToUpload}
      appsForUpload={appsForUpload}
    />
  )
}

interface OsReceiveScreenViewProps {
  filesToUpload: OsReceiveFile[]
  appsForUpload: AppForUpload[] | undefined
}

export const OsReceiveScreenView = ({
  filesToUpload,
  appsForUpload
}: OsReceiveScreenViewProps): JSX.Element | null => {
  const { t } = useI18n()
  const {
    selectedOption,
    setSelectedOption,
    canProceed,
    proceedToWebview,
    hasAppsForUpload
  } = useOsReceiveScreenLogic()
  const { colors } = useCozyTheme('normal')

  useFlagshipUI(
    'OsReceiveScreen',
    ScreenIndexes.OS_RECEIVE_SCREEN,
    defaultFlagshipUI
  )

  const isSingleFile = filesToUpload.length === 1
  const isMultipleFiles = filesToUpload.length > 1

  return (
    <Container style={osReceiveScreenStyles.page}>
      <Grid container direction="column" justifyContent="space-between">
        <Grid alignItems="center">
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
            <>
              <FileThumbnail
                filePath={filesToUpload[0].file.filePath}
                mimeType={filesToUpload[0].file.mimeType}
                style={osReceiveScreenStyles.thumbnail}
              />
              <Typography
                variant="h5"
                style={
                  osReceiveScreenStyles.singleFileTitle as StyleProp<TextStyle>
                }
              >
                {filesToUpload[0].name}
              </Typography>
            </>
          ) : null}

          <List
            subheader={
              <ListSubHeader>
                <Typography variant="subtitle2">
                  {t('services.osReceive.documentType')}
                </Typography>
              </ListSubHeader>
            }
          >
            {appsForUpload?.map((app, index) => (
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
                          color={colors.secondaryTextColor}
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
                        {
                          // We only show the first reason for the app being disabled.
                          // We don't want to remove the other reasons instead, because they might be useful for debugging
                          app.reasonDisabled[0]
                        }
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
          variant="primary"
          onPress={proceedToWebview}
          disabled={canProceed()}
          label={t(
            hasAppsForUpload()
              ? 'services.osReceive.submit'
              : 'services.osReceive.abort'
          )}
        />
      </Grid>
    </Container>
  )
}
