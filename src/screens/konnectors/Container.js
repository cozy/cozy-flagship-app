import React, {useState} from 'react'
import {StyleSheet, View} from 'react-native'
import HarvestView from './HarvestView'
import LauncherView from './LauncherView'

const Container = () => {
  const [launcherContext, setLauncherContext] = useState(null)
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
