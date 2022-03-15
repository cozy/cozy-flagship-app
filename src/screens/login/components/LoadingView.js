import React from 'react'
import {View, Text} from 'react-native'

export const LoadingView = ({message}) => {
  return (
    <View>
      <Text>LOADING</Text>
      <Text>{message}</Text>
    </View>
  )
}
