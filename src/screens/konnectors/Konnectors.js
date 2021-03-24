import React from 'react'
import {SafeAreaView, StatusBar, StyleSheet, View} from 'react-native'
import CozyApp from './CozyApp'

const Konnectors = ({navigation}) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeAreaView}>
        <CozyApp />
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
