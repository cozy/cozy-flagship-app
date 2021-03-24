import React from 'react'
import {Button as PButton} from 'react-native-paper'
import {StyleSheet} from 'react-native'

const PaperButton = ({mode, children, ...props}) => (
  <PButton
    mode={mode || 'contained'}
    {...props}
    color="#FFF"
    style={styles.button}>
    {children}
  </PButton>
)

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#3077AC',
  },
})

export default PaperButton
