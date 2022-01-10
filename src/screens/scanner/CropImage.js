import React from 'react'
import {View, Image, StyleSheet, TouchableOpacity, Text} from 'react-native'

export const CropImage = ({image, onRetry}) => {
  return (
    <View style={{flex: 1}}>
      <Image
        source={{
          uri: `data:image/jpeg;base64,${image}`,
        }}
        style={styles.photoPreview}
      />
      <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.buttonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  photoPreview: {
    flex: 1,
    width: '100%',
    resizeMode: 'contain',
  },
  retryButton: {
    alignSelf: 'center',
    position: 'absolute',
    bottom: 32,
  },
  buttonText: {
    backgroundColor: 'rgba(245, 252, 255, 0.7)',
    fontSize: 32,
  },
})
