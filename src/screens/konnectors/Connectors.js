import React, {useState} from 'react'
import {SafeAreaView, StatusBar, StyleSheet, View} from 'react-native'
import HarvestView from './HarvestView'
import LauncherView from './LauncherView'

const Konnectors = ({navigation}) => {
  const [launcherContext, setLauncherContext] = useState({state: 'default'})
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeAreaView}>
        <HarvestView setLauncherContext={setLauncherContext} />
        {launcherContext.state === 'launch' && (
          <LauncherView
            launcherContext={launcherContext.value}
            setLauncherContext={setLauncherContext}
            retry={() => setLauncherContext(null)}
          />
        )}
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  safeAreaView: {
    flex: 1,
  },
  launcherView: {
    position: 'absolute',
    height: 0,
    width: 0,
  },
})

export default Konnectors
