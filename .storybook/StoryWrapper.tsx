import React from 'react'
import { View } from 'react-native'

export const StoryWrapper = (Story: () => JSX.Element): JSX.Element => (
  <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
    <Story />
  </View>
)
