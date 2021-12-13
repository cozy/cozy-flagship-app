/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react'
import {
  StyleSheet,
  View,
  Button,
  SafeAreaView,
  ScrollView,
  Text,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import {launchImageLibrary, launchCamera} from 'react-native-image-picker'
import MlkitOcr from 'react-native-mlkit-ocr'

export const OCR = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [image, setImage] = useState(null)

  const processImageResponse = async (response) => {
    if (!response.assets || response.assets.length < 1) {
      throw new Error('No image in response')
    }
    try {
      const img = response.assets[0]
      setImage(img)
      setResult(await MlkitOcr.detectFromUri(img.uri))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const getFromCamera = async () => {
    const response = await launchCamera({
      mediaType: 'photo',
    })
    console.log('camera response : ', response)
    await processImageResponse(response)
  }

  const getFromGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
      },
      async (response) => {
        await processImageResponse(response)
      },
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator />
      </SafeAreaView>
    )
  }
  console.log('result : ', result)
  return (
    <SafeAreaView style={styles.container}>
      {!!result?.length && (
        <ScrollView
          contentContainerStyle={{
            alignItems: 'stretch',
            padding: 20,
            height: Dimensions.get('window').height,
          }}
          showsVerticalScrollIndicator
          style={styles.scroll}>
          {result?.map((block) => {
            return block.lines.map((line) => {
              return (
                <View
                  key={line.text}
                  style={{
                    backgroundColor: '#ccccccaf',
                    position: 'absolute',
                    top: fitHeight(line.bounding.top, image?.height ?? 0),
                    height: fitHeight(line.bounding.height, image?.height ?? 0),
                    left: fitWidth(line.bounding.left, image?.width ?? 0),
                    width: fitWidth(line.bounding.width, image?.width ?? 0),
                  }}>
                  <Text style={{fontSize: 10}}>{line.text}</Text>
                </View>
              )
            })
          })}
        </ScrollView>
      )}

      <Button
        onPress={() => {
          setLoading(true)
          getFromGallery()
        }}
        title="OCR from gallery"
      />
      <Button
        onPress={() => {
          setLoading(true)
          getFromCamera()
        }}
        title="OCR from camera"
      />
    </SafeAreaView>
  )
}

function fitWidth(value, imageWidth) {
  const fullWidth = Dimensions.get('window').width
  return (value / imageWidth) * fullWidth
}

function fitHeight(value, imageHeight) {
  const fullHeight = Dimensions.get('window').height
  return (value / imageHeight) * fullHeight
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 2,
  },
})
