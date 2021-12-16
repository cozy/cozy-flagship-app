import React, {useEffect, useMemo, useState} from 'react'
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native'

import CustomCrop from 'react-native-perspective-image-cropper'

export const CropView = ({image, width, height, rectangleCoordinates}) => {
  const [customCrop, setCustomCrop] = useState(null)
  const [cropImage, setCropImage] = useState(image)
  const [coordinates, setCoordinates] = useState({
    topLeft: {x: 10, y: 10},
    topRight: {x: 10, y: 10},
    bottomRight: {x: 10, y: 10},
    bottomLeft: {x: 10, y: 10},
  })
  const [imageSize, setImageSize] = useState({width, height})

  /*
  useEffect(() => {
    Image.getSize(image, (width, height) => {
      console.log('width : ', width)
      console.log('height : ', height)
      setImageSize({
        width,
        height,
      })
    })
  })*/

  const updateImage = (updatedImage, newCoordinates) => {
    setCoordinates(newCoordinates)
    setCropImage(updatedImage)
  }

  const crop = () => {
    console.log('go crop')
    customCrop.crop()
  }

  console.log('size : ', imageSize)
  console.log('coords : ', rectangleCoordinates)

  return (
    <View>
      <CustomCrop
        updateImage={updateImage}
        rectangleCoordinates={coordinates}
        initialImage={image}
        height={imageSize.height}
        width={imageSize.width}
        ref={(ref) => setCustomCrop(ref)}
        overlayColor="rgba(18,190,210, 1)"
        overlayStrokeColor="rgba(20,190,210, 1)"
        handlerColor="rgba(20,150,160, 1)"
        enablePanStrict={false}
      />
      <TouchableOpacity onPress={crop}>
        <Text>CROP IMAGE</Text>
      </TouchableOpacity>
    </View>
  )
}
