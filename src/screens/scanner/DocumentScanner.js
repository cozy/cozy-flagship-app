import React, {useState, useEffect} from 'react'
import {View, Image, StyleSheet} from 'react-native'
import DocumentScanner from 'react-native-document-scanner'
import {CropView} from './CropView'

export const Scanner = () => {
  const [scanned, setScanned] = useState({})
  const [imageSize, setImageSize] = useState(null)

  useEffect(() => {
    if (scanned.initialImage) {
      Image.getSize(scanned.initialImage, (width, height) => {
        setImageSize({width, height})
      })
    }
  }, [scanned])

  const handleImageScanner = data => {
    setScanned({
      croppedImage: data.croppedImage,
      initialImage: data.initialImage,
      rectangleCoordinates: data.rectangleCoordinates,
    })
  }

  const retry = () => {
    setScanned({})
  }

  if (scanned.croppedImage && imageSize) {
    if (!scanned.rectangleCoordinates) {
      // This is a safeguard, but should never happen
      setScanned({})
    }
    console.log('received coordinates : ', scanned.rectangleCoordinates)

    return (
      <CropView
        initialImage={scanned.initialImage}
        rectangleCoordinates={scanned.rectangleCoordinates}
        imageSize={imageSize}
        onRetry={retry}
      />
    )
  }

  return (
    <View style={{flex: 1}}>
      <DocumentScanner
        style={styles.scanner}
        saveInAppDocument={false}
        onPictureTaken={handleImageScanner}
        overlayColor="#297EF2" // The colors are passed to the native part, hence cannot use cozy-ui vars here.
        enableTorch={false}
        brightness={0.3}
        saturation={1}
        contrast={1.1}
        quality={0.5}
        detectionCountBeforeCapture={5}
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
