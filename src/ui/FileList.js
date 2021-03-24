import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {List, Divider} from 'react-native-paper'
import {useNavigation} from '@react-navigation/native'
import FileTypeFolder from '../assets/file-type-folder.svg'
import FileTypeText from '../assets/file-type-text.svg'

const ExtraRightComponent = () => (
  <View
    style={{
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
    }}>
    <Text style={styles.description}>metadata</Text>
    <Text style={styles.description}>metadata</Text>
  </View>
)

const iconStyle = {marginLeft: 10, marginRight: 10}
const FileList = () => {
  const navigation = useNavigation()

  const items = Array(14)
    .fill()
    .map((_, id) => {
      const isFolder = id % 3 === 0
      const type = isFolder ? 'folder' : 'file'
      const name = `${type} ${id}`
      return (
        <View key={id}>
          <List.Item
            title={name}
            left={() =>
              isFolder ? (
                <FileTypeFolder style={iconStyle} />
              ) : (
                <FileTypeText style={iconStyle} />
              )
            }
            right={() => <ExtraRightComponent />}
            style={styles.item}
            onPress={() =>
              navigation.navigate('Details', {
                id,
                type,
                name,
              })
            }
          />
          <Divider />
        </View>
      )
    })
  return (
    <>
      <List.Section
        title="SECTION 1"
        titleStyle={{fontSize: 12, color: '#95999d'}}
        style={styles.section}>
        {items}
      </List.Section>
      <List.Section title="SECTION 2" style={styles.section}>
        <List.Item
          title="I'm a primary text"
          left={() => (
            <View style={styles.iconContainer}>
              <FileTypeText style={{marginLeft: 10, marginRight: 10}} />
            </View>
          )}
          description="I'm a secondary text"
          style={styles.item}
          titleStyle={styles.title}
          descriptionStyle={styles.description}
        />
      </List.Section>
    </>
  )
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#F5F6F7',
  },
  item: {
    backgroundColor: '#FFF',
  },
  description: {
    fontSize: 10,
    color: '#95999D',
  },
  iconContainer: {
    justifyContent: 'center',
  },
  icon: {
    marginLeft: 10,
    marginRight: 10,
  },
})

export default FileList
