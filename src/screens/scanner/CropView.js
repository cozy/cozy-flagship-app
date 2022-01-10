import React, {useEffect, useMemo, useState, useRef} from 'react'
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native'
import {CropImage} from './CropImage'
import CustomCrop from 'react-native-perspective-image-cropper'

/*
  TODO 28/12/21
  Sur la détection en elle meme:
    - Le paramètre detectionCountBeforeCapture fait prendre la photo trop vite si 5, mais prend trop de temps si 50, notamment sur iphone
    - Il est perfectible, mais fait le job. Faiblard quand doc avec plusieurs rectangles (carte électeur) ou fond pas assez constraté
    - L'app crash parfois : peut être parce que rectangleCoordinates n'est pas toujours dispo ? mPreviewPoints peut être null
  Sur le cropping:
    - Retraitemetn des coordonnées renvoyées par le natif, sans trop comprendre pourquoi
    - Les coordonnées redonnées pour croper l'image finale est fausse -> fixer ça
*/

export const CropView = ({initialImage, rectangleCoordinates, onRetry}) => {
  const customCrop = useRef(null)
  //const [customCrop, setCustomCrop] = useState(null)
  const [image, setImage] = useState(initialImage)
  const [croppedImage, setCroppedImage] = useState(null)
  const [coordinates, setCoordinates] = useState(rectangleCoordinates)
  const [imageSize, setImageSize] = useState({width: 540, height: 1088})
  const [shouldDisplayCroppedImage, setShouldDisplayCroppedImage] =
    useState(false)

  useEffect(() => {
    Image.getSize(image, (width, height) => {
      console.log('image width : ', width)
      console.log('image height : ', height)
      setImageSize({
        width,
        height,
      })
    })
  }, [image])

  const updateCroppedImage = (updatedImage, newCoordinates) => {
    setCoordinates(newCoordinates)
    setCroppedImage(updatedImage)
    setShouldDisplayCroppedImage(true)
  }

  const crop = () => {
    customCrop.current.crop()
  }

  if (shouldDisplayCroppedImage) {
    return <CropImage image={croppedImage} onRetry={onRetry} />
  } else {
    return (
      <View style={styles.cropContainer}>
        <CustomCrop
          updateImage={updateCroppedImage}
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
}

const styles = StyleSheet.create({
  cropContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  photoPreview: {
    flex: 1,
    width: '100%',
    resizeMode: 'contain',
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
