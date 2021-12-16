import React, {useState, useEffect} from 'react'
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native'
import DocumentScanner from 'react-native-document-scanner'
//import DocumentScanner from '@woonivers/react-native-document-scanner'
import {CropView} from './Crop'
import {ImagePreview} from './ImagePreview'

export const Scanner = () => {
  const [scanned, setScanned] = useState({})
  const [scanner, setScanner] = useState(null)
  const [isValidatingImageCropping, setIsValidatingImageCropping] =
    useState(false)
  const [scanParams, setScanParams] = useState({})
  const [allowed, setAllowed] = useState(false)

  const handlePressCrop = () => {
    setIsValidatingImageCropping(true)
  }

  /**
   * Start image cropping
   */
  const startImageCropping = () => {
    console.log('scanner in crop : ', scanner)
    scanner.cropImage().then(({image}) => {
      console.log('crop : ', image)
      setScanned({image, isValidatingImageCropping: false})
    })
  }

  const handleImageScanner = (data) => {
    console.log('data picture taken : ', data)
    console.log('coordinates : ', data.rectangleCoordinates)
    setScanned({
      croppedImage: data.croppedImage,
      initialImage: data.initialImage,
      rectangleCoordinates: data.rectangleCoordinates,
    })
  }

  const onRectangleDetect = ({stableCounter, lastDetectionType}) => {
    console.log('stable counter : ', stableCounter)
    console.log('lastDetectionType : ', lastDetectionType)
    setScanParams({stableCounter, lastDetectionType})
  }

  const retry = () => {
    setScanned({})
  }

  if (scanned.croppedImage) {
    // FIXME: sometimes the coordinates are NOT provided
    const coordinates = scanned.rectangleCoordinates
      ? scanned.rectangleCoordinates
      : {
          bottomLeft: {x: 40, y: 715},
          bottomRight: {x: 421, y: 736},
          topLeft: {x: 75, y: 290},
          topRight: {x: 425, y: 374},
        }

    return (
      <ImagePreview
        uri={scanned.initialImage}
        onRetry={retry}
        rectangleCoordinates={coordinates}
      />
    )
  }

  return (
    <View style={{flex: 1}}>
      <DocumentScanner
        style={styles.scanner}
        saveInAppDocument={false}
        onPictureTaken={handleImageScanner}
        overlayColor="rgba(255,130,0, 0.7)"
        enableTorch={false}
        brightness={0.3}
        saturation={1}
        contrast={1.1}
        quality={0.5}
        onRectangleDetect={onRectangleDetect}
        detectionCountBeforeCapture={15}
        detectionRefreshRateInMS={50}
        onPermissionsDenied={() => console.log('Permissions Denied')}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  scanner: {
    flex: 1,
    aspectRatio: undefined,
  },
  button: {
    alignSelf: 'center',
    position: 'absolute',
    bottom: 32,
  },
  buttonText: {
    backgroundColor: 'rgba(245, 252, 255, 0.7)',
    fontSize: 32,
  },
  preview: {
    flex: 1,
    width: '100%',
    resizeMode: 'cover',
  },
  permissions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
