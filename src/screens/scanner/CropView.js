import React, {useEffect, useMemo, useState, useRef} from 'react'
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native'

import CustomCrop from 'react-native-perspective-image-cropper'

export const CropView = ({initialImage, rectangleCoordinates, onRetry}) => {
  const customCrop = useRef()
  //const [customCrop, setCustomCrop] = useState(null)
  const [image, setImage] = useState(initialImage)
  const [coordinates, setCoordinates] = useState(rectangleCoordinates)
  const [imageSize, setImageSize] = useState({width: 540, height: 1088})

  useEffect(() => {
    Image.getSize(image, (width, height) => {
      console.log('width crop : ', width)
      console.log('height width crop: ', height)
      /*setImageSize({
        width,
        height,
      })*/
    })
  }, [image])

  const updateImage = (updatedImage, newCoordinates) => {
    setCoordinates(newCoordinates)
    setImage(updatedImage)
  }

  const crop = () => {
    console.log('go crop ', customCrop.current)
    customCrop.current.crop()
  }

  console.log('size : ', imageSize)
  console.log('coords : ', rectangleCoordinates)

  return (
    <View style={styles.cropContainer}>
      <CustomCrop
        updateImage={updateImage}
        rectangleCoordinates={coordinates}
        initialImage={initialImage}
        height={imageSize.height}
        width={imageSize.width}
        ref={customCrop}
        overlayColor="rgba(18,190,210, 1)"
        overlayStrokeColor="rgba(20,190,210, 1)"
        handlerColor="rgba(20,150,160, 1)"
        enablePanStrict={false}
      />
      <TouchableOpacity onPress={crop} style={styles.cropButton}>
        <Text style={styles.buttonText}>Crop image</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.buttonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  cropContainer: {
    position: 'absolute',
    width: 384,
    height: 720,
    left: 0,
    justifyContent: 'center',
  },
  photoPreview: {
    flex: 1,
    width: '100%',
    resizeMode: 'cover',
  },
  retryButton: {
    alignSelf: 'flex-start',
    position: 'absolute',
    bottom: 32,
  },
  cropButton: {
    alignSelf: 'flex-end',
    position: 'absolute',
    bottom: 32,
  },
  buttonText: {
    backgroundColor: 'rgba(245, 252, 255, 0.7)',
    fontSize: 32,
  },
})
