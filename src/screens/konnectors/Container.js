import React, {useState} from 'react'
import {StyleSheet, View} from 'react-native'
import HarvestView from './HarvestView'
import LauncherView from './LauncherView'

const Container = () => {
  // const [launcherContext, setLauncherContext] = useState(null)
  const [launcherContext, setLauncherContext] = useState({
    job: {
      id: 'job test id',
      trigger_id: 'trigger test id',
      message: {
        konnector: 'test',
        account: 'account test id',
      },
    },
  })
  return (
    <View style={styles.container}>
      {launcherContext ? (
        <LauncherView
          launcherContext={launcherContext}
          retry={() => setLauncherContext(null)}
        />
      ) : (
        <HarvestView setLauncherContext={setLauncherContext} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {flex: 1},
})

export default Container
