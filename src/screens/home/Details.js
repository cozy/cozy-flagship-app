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
import {useRoute} from '@react-navigation/native'
import {isWebApp} from '../../utils'

const Details = ({navigation}) => {
  const route = useRoute()
  const {id, type, name} = route.params
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <View style={styles.contentContainer}>
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Details</Text>
              <View style={styles.infos}>
                <Text>ID :</Text>
                <Text>{id}</Text>
              </View>
              <View style={styles.infos}>
                <Text>Type :</Text>
                <Text>{type}</Text>
              </View>
              <View style={styles.infos}>
                <Text>Name :</Text>
                <Text>{name}</Text>
              </View>
            </View>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('FileListPage')}>
              Go Back
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
    height: 140,
  },
  descriptionTitle: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  infos: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
})

export default Details
