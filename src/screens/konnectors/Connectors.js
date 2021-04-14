import React, {useState} from 'react'
import {SafeAreaView, StatusBar, StyleSheet, View} from 'react-native'
import HarvestView from './HarvestView'
import LauncherView from './LauncherView'

const Konnectors = ({navigation}) => {
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
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeAreaView}>
        {launcherContext ? (
          <LauncherView
            launcherContext={launcherContext}
            retry={() => setLauncherContext(null)}
          />
        ) : (
          <HarvestView setLauncherContext={setLauncherContext} />
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
  contentContainer: {
    alignItems: 'center',
    margin: 20,
  },
  descriptionContainer: {
    alignItems: 'center',
    height: 200,
  },
  description: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  safeAreaView: {
    flex: 1,
  },
})

export default Konnectors
