import React, {useState, useEffect, useCallback, useMemo} from 'react'
import {View, Image, StyleSheet, TouchableOpacity, Text} from 'react-native'

export const ImagePreview = ({uri, rectangleCoordinates, onRetry}) => {
  const [layoutSize, setLayoutSize] = useState({})
  const [imgOriginalSize, setImgOriginalSize] = useState({})

  // TODO: refactor and fix

  const widthRatio = useMemo(() => {
    if (layoutSize.width < imgOriginalSize.width) {
      return layoutSize.width / imgOriginalSize.width
    }
    return 1
  }, [layoutSize, imgOriginalSize])

  const heightRatio = useMemo(() => {
    if (layoutSize.height < imgOriginalSize.height) {
      return layoutSize.height / imgOriginalSize.height
    }
    return 1
  }, [layoutSize, imgOriginalSize])

  const widthWithRatio = useMemo(() => {
    const {topRight, topLeft} = rectangleCoordinates
    if (widthRatio !== 1) {
      console.log('width ratio : ', widthRatio)
      return (topRight.x - topLeft.x) * widthRatio
    }
    return topRight.x - topLeft.x
  }, [widthRatio, rectangleCoordinates])

  const heightWithRatio = useMemo(() => {
    const {bottomLeft, topLeft} = rectangleCoordinates
    if (heightRatio !== 1) {
      console.log('height ratio : ', heightRatio)
      return (bottomLeft.y - topLeft.y) * heightRatio
    }
    return bottomLeft.y - topLeft.y
  }, [heightRatio, rectangleCoordinates])

  const topWithRatio = useMemo(() => {
    const {topLeft} = rectangleCoordinates
    if (heightRatio !== 1) {
      return topLeft.y * heightRatio
    }
    return topLeft.y
  }, [heightRatio, rectangleCoordinates])

  if (rectangleCoordinates) {
    console.log('coordinates : ', rectangleCoordinates)
    const {topLeft, topRight, bottomLeft} = rectangleCoordinates
    const height = bottomLeft.y - topLeft.y
    const width = topRight.x - topLeft.x
    const top = topLeft.y
    const left = topLeft.x

    console.log('width : ', width)
    console.log('heigth : ', height)
    console.log('left : ', left)
    console.log('top : ', top)

    console.log('top with ratio : ', topWithRatio)

    const onLayout = (event) => {
      console.log('layout : ', event.nativeEvent.layout)
      const {x, y, width, height} = event.nativeEvent.layout
      setLayoutSize({width, height})
      Image.getSize(uri, (imgWidth, imgHeight) => {
        setImgOriginalSize({width: imgWidth, height: imgHeight})
      })
    }

    return (
      <View style={{flex: 1}} onLayout={onLayout}>
        <Image source={{uri}} style={styles.photoPreview} />
        <View
          style={[
            styles.rectangle,
            {
              width: widthWithRatio,
              height: heightWithRatio,
              top: topWithRatio,
              left,
            },
          ]}
        />
        <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  } else {
    return (
      <View style={{flex: 1}}>
        <Image source={{uri}} style={styles.photoPreview} />
        <View style={styles.rectangle} />
        <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 600,
    flex: 1,
    position: 'absolute',
    marginLeft: 50,
  },
  rectangle: {
    borderWidth: 3,
    borderColor: 'green',
    position: 'absolute',
  },
  trapeze: {
    width: 100,
    height: 0,
    borderBottomWidth: 100,
    borderColor: 'green',
    borderBottomColor: 'transparent',
    borderLeftWidth: 50,
    borderLeftColor: 'transparent',
    borderRightWidth: 50,
    borderRightColor: 'transparent',
    borderStyle: 'solid',
    position: 'absolute',
  },
  photoPreview: {
    flex: 1,
    width: '100%',
    resizeMode: 'cover',
  },
  retryButton: {
    alignSelf: 'center',
    position: 'absolute',
    bottom: 32,
  },
  retryButtonText: {
    backgroundColor: 'rgba(245, 252, 255, 0.7)',
    fontSize: 32,
  },
})
