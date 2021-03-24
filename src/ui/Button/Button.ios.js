import React from 'react'
import {Button as PButton} from 'react-native-paper'
import {StyleSheet} from 'react-native'

const PaperButton = ({mode, children, ...props}) => (
  <PButton mode={mode || 'contained'} {...props} style={styles.icon}>
    {children}
  </PButton>
)

const styles = StyleSheet.create({
  button: {},
})

export default PaperButton
