import React from 'react'
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import {InAppBrowser} from 'react-native-inappbrowser-reborn'

import Button from '../../ui/Button'

const openURL = async (url) => {
  try {
    if (await InAppBrowser.isAvailable()) {
      const result = await InAppBrowser.open(url, {
        // iOS Properties
        dismissButtonStyle: 'cancel',
        preferredBarTintColor: '#453AA4',
        preferredControlTintColor: 'white',
        readerMode: false,
        animated: true,
        modalPresentationStyle: 'fullScreen',
        modalTransitionStyle: 'coverVertical',
        modalEnabled: true,
        enableBarCollapsing: false,
        // Android Properties
        showTitle: true,
        toolbarColor: '#6200EE',
        secondaryToolbarColor: 'black',
        enableUrlBarHiding: true,
        enableDefaultShare: true,
        forceCloseOnRedirection: false,
        // Specify full animation resource identifier(package:anim/name)
        // or only resource name(in case of animation bundled with app).
        animations: {
          startEnter: 'slide_in_right',
          startExit: 'slide_out_left',
          endEnter: 'slide_in_left',
          endExit: 'slide_out_right',
        },
        headers: {
          'my-custom-header': 'my custom header value',
        },
      })
      Alert.alert(JSON.stringify(result))
    } else {
      Linking.openURL(url)
    }
  } catch (error) {
    Alert.alert(error.message)
  }
}
const Settings = ({navigation}) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <View style={styles.contentContainer}>
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>Settings Page</Text>
            </View>
            <Button mode="outlined" onPress={() => navigation.navigate('Home')}>
              Go to Home
            </Button>
            <Button mode="outlined" onPress={() => openURL('https://cozy.io')}>
              Open cozy in app inAppBrowser
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

export default Settings
