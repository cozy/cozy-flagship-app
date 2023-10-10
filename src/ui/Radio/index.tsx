import React from 'react'
import { View } from 'react-native'

import { styles } from '/ui/Radio/styles'

interface RadioProps {
  checkedIcon?: JSX.Element
  disabled?: boolean
  icon?: JSX.Element
  selected: boolean
}

export const Radio = ({ selected }: RadioProps): JSX.Element => (
  <View style={styles.radioButton}>
    <View style={[styles.circle, selected && styles.selected]} />
  </View>
)
