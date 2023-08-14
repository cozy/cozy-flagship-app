import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'

import { useSharingMode } from './useSharing'

export const SharingScreen = (): JSX.Element => {
  const [numberOfFiles, setNumberOfFiles] = useState(0)
  const { filesToUpload } = useSharingMode()

  useEffect(() => {
    setNumberOfFiles(filesToUpload.length)

    return () => {
      setNumberOfFiles(0)
    }
  }, [filesToUpload])

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Number of files to upload: {numberOfFiles}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    backgroundColor: '#000',
    fontSize: 18,
    color: '#fff'
  }
})
