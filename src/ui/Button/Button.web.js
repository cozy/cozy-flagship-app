import React from 'react'
import {StyleSheet, View} from 'react-native'
import {Button as PButton} from 'react-native-paper'

const PaperButton = ({mode, action, onPress, children, ...rest}) => {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <View
      onClick={onPress}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{transitionDuration: '150ms', opacity: isHovered ? 0.7 : 1}}
      {...rest}>
      <PButton
        mode={mode || 'contained'}
        {...rest}
        color="white"
        onPress={onPress}
        style={styles.button}>
        {children}
      </PButton>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ECB52C',
  },
})

export default PaperButton
