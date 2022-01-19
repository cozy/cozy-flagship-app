import React, {useState, useRef} from 'react'
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native'
import {CropImage} from './CropImage'
import CustomCrop from 'react-native-perspective-image-cropper'

export const CropView = ({
  initialImage,
  rectangleCoordinates,
  onRetry,
  imageSize,
}) => {
  const customCrop = useRef(null)
  const [croppedImage, setCroppedImage] = useState(null)
  const [coordinates, setCoordinates] = useState(rectangleCoordinates)

  const [shouldDisplayCroppedImage, setShouldDisplayCroppedImage] =
    useState(false)

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
          overlayColor="#297EF2" // The colors are passed to the native part, hence cannot use cozy-ui vars here.
          overlayStrokeColor="#297EF2"
          handlerColor="#297EF2"
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
