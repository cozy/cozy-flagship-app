import React, { useCallback, useEffect, useState } from 'react'
import { SvgXml } from 'react-native-svg'

import { Icon } from '/ui/Icon'
import { IconButton } from '/ui/IconButton'
import { CozyCircle } from '/ui/Icons/CozyCircle'
import { Container } from '/ui/Container'
import { Grid } from '/ui/Grid'
import { Button } from '/ui/Button'
import { iconFallback, iconTable } from '/libs/functions/iconTable'
import { useI18n } from '/locales/i18n'
import { Radio } from '/ui/Radio'
import { Typography } from '/ui/Typography'
import { useDefaultIconParams } from '/libs/functions/openApp'
import { navigate } from '/libs/RootNavigation'
import { routes } from '/constants/routes'
import {
  useAppsForUpload,
  useFilesToUpload,
  useOsReceiveDispatch
} from '/app/view/OsReceive/OsReceiveState'
import {
  OsReceiveActionType,
  OsReceiveFileStatus
} from '/app/domain/osReceive/models/OsReceiveState'
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubHeader
} from '/ui/List'

export const OsReceiveScreen = (): JSX.Element | null => {
  const iconParams = useDefaultIconParams()
  const filesToUpload = useFilesToUpload()
  const appsForUpload = useAppsForUpload()
  const osReceiveDispatch = useOsReceiveDispatch()
  const { t } = useI18n()
  const [selectedOption, setSelectedOption] = useState<string>()

  const canProceed = useCallback(
    () => !(filesToUpload.length > 0),
    [filesToUpload]
  )

  const proceedToWebview = useCallback(() => {
    navigate(routes.cozyapp, {
      href: appsForUpload.find(app => app.slug === selectedOption)
        ?.routeToUpload,
      slug: selectedOption,
      iconParams
    })
    osReceiveDispatch({
      type: OsReceiveActionType.UpdateFileStatus,
      payload: { name: '*', status: OsReceiveFileStatus.queued }
    })
  }, [appsForUpload, iconParams, osReceiveDispatch, selectedOption])

  useEffect(() => {
    const firstEnabledApp = appsForUpload.find(app => !app.reasonDisabled)

    if (firstEnabledApp) {
      setSelectedOption(firstEnabledApp.slug)
    }
  }, [appsForUpload])

  if (filesToUpload.length === 0) return null

  return (
    <Container>
      <Grid container direction="column" justifyContent="space-between">
        <Grid>
          <IconButton
            onPress={(): void => {
              osReceiveDispatch({
                type: OsReceiveActionType.SetInitialState
              })
            }}
          >
            <Icon icon={CozyCircle} />
          </IconButton>

          {filesToUpload.length > 1 ? (
            <Typography>{t('services.osReceive.importTitle')}</Typography>
          ) : null}
        </Grid>

        <Grid direction="column">
          <List
            subheader={
              <ListSubHeader>
                <Typography>{t('services.osReceive.documentType')}</Typography>
              </ListSubHeader>
            }
          >
            {appsForUpload.map(app => (
              <ListItem
                button={!app.reasonDisabled && app.slug !== selectedOption}
                onClick={(): void => setSelectedOption(app.slug)}
                key={app.slug}
              >
                <ListItemIcon>
                  <Icon
                    icon={(): JSX.Element => (
                      <SvgXml
                        xml={iconTable[app.slug]?.xml ?? iconFallback}
                        width={16}
                        height={16}
                      />
                    )}
                  />
                </ListItemIcon>

                <ListItemText>
                  <Typography>{app.name}</Typography>

                  {app.reasonDisabled && (
                    <Typography>{app.reasonDisabled}</Typography>
                  )}
                </ListItemText>

                <Radio selected={selectedOption === app.slug} />
              </ListItem>
            ))}
          </List>
        </Grid>

        <Button onPress={proceedToWebview} disabled={canProceed()}>
          <Typography color="primary" variant="button">
            {t('services.osReceive.submit')}
          </Typography>
        </Button>
      </Grid>
    </Container>
  )
}
