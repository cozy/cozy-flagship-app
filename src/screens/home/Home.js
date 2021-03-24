import React from 'react'
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Button from '../../ui/Button'

const Home = ({navigation}) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView>
          <View style={styles.contentContainer}>
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>Home Page</Text>
            </View>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('FileListPage')}>
              Go to File List
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Settings')}>
              Go to Settings Page
            </Button>
          </View>
        </ScrollView>
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
})

export default Home
