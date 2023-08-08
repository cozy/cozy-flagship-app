import React, { useEffect } from 'react'
import { View, Text, Linking } from 'react-native'
import ShareExtension from 'react-native-share-extension'

export const ShareComponent = (): JSX.Element => {
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await ShareExtension.data()
        console.log('💥', data)
        if (data) {
          const { type, value } = data // Assume that type and value represent the shared data
          console.log('Share data:', type, value)
          Linking.openURL(`cozy://share?type=${type}&value=${value}`)
        }
      } catch (error) {
        console.log('Error retrieving share data:', error)
      } finally {
        ShareExtension.close()
      }
    }
    fetchData()
  }, [])

  return (
    <View>
      <Text>Share Extension Placeholder</Text>
    </View>
  )
}
