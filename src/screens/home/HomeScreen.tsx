import React, { useState } from 'react'
import { StatusBar, View } from 'react-native'

import Minilog from '@cozy/minilog'
const konnLog = Minilog('Konnector')

import {
  NavigationProp,
  ParamListBase,
  RouteProp
} from '@react-navigation/native'
import { useConnectors } from '/hooks/useConnectors'
import { LogObj } from '/redux/ConnectorState/ConnectorLogsSlice'

import CozyClient, { CozyProvider } from 'cozy-client'

import HomeView from '/screens/home/components/HomeView'
import LauncherView from '/screens/connectors/LauncherView'
import { StatusBarStyle } from '/libs/intents/setFlagshipUI'
import { styles } from '/screens/home/HomeScreen.styles'
import { useLauncherClient } from '/hooks/useLauncherClient'
import { LauncherContext } from '/libs/connectors/models'

interface HomeScreenProps {
  navigation: NavigationProp<ParamListBase>
  route: RouteProp<ParamListBase>
}

const isLauncherReady = (
  context: LauncherContext
): context is LauncherContext => context.state !== 'default'

const isClientReady = (client: CozyClient | undefined): client is CozyClient =>
  Boolean(client)

export const HomeScreen = ({
  navigation,
  route
}: HomeScreenProps): JSX.Element => {
  const [barStyle, setBarStyle] = useState(StatusBarStyle.Light)
  const [launcherContext, setLauncherContext] = useState<{
    state: string
    value?: Record<string, unknown>
  } | null>({ state: 'default' })
  const { addLog } = useConnectors()

  const onKonnectorLog = (logObj: LogObj): void => {
    const level = logObj.level
    if (level in konnLog) {
      const key = level as keyof MiniLogger
      konnLog[key](`${logObj.slug}: ${logObj.msg}`)
    }
    addLog(logObj)
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={barStyle} />

      <HomeView
        navigation={navigation}
        route={route}
        setBarStyle={setBarStyle}
        setLauncherContext={setLauncherContext}
      />

      {launcherContext?.state === 'launch' && (
        <LauncherView
          launcherContext={launcherContext.value}
          retry={(): void => setLauncherContext(null)}
          setLauncherContext={setLauncherContext}
          onKonnectorLog={onKonnectorLog}
        />
      )}
    </View>
  )
}
