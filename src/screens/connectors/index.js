import React, {useState} from 'react'
import {SafeAreaView, StatusBar, StyleSheet, View} from 'react-native'
import HomeView from './HomeView'
import LauncherView from './LauncherView'

const Konnectors = ({navigation}) => {
  const [launcherContext, setLauncherContext] = useState({state: 'default'})
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaView}>
        <StatusBar barStyle="dark-content" />
        <HomeView setLauncherContext={setLauncherContext} />
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
})

export default Konnectors
