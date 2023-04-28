/* eslint-disable promise/always-return */
/* eslint-disable no-empty */
/* eslint-disable no-console */
import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import React, { useState, useEffect } from 'react'
import {
  View,
  Button,
  Image,
  PermissionsAndroid,
  Platform,
  Switch,
  TextInput,
  StyleSheet,
  Text
} from 'react-native'
import RNBU from 'react-native-background-upload'
import RNFS from 'react-native-fs'

import { useClient } from 'cozy-client'

async function hasAndroidPermission() {
  const permission =
    Platform.Version >= 33
      ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE

  const hasPermission = await PermissionsAndroid.check(permission)
  if (hasPermission) {
    return true
  }

  const status = await PermissionsAndroid.request(permission)
  return status === 'granted'
}

const getMediasFromCameraRoll = async numberOfMedias => {
  console.log(
    `Getting ${parseInt(numberOfMedias, 10)} medias from CameraRoll...`
  )
  const photos = await CameraRoll.getPhotos({
    first: parseInt(numberOfMedias, 10),
    // groupTypes: 'Album',
    // groupName: 'Pictures',
    // assetType: 'Photos',
    // assetType: 'Videos',
    // mimeTypes: ['image/jpeg'],
    // mimeTypes: ['image/heic'],
    include: ['filename', 'fileExtension', 'location', 'imageSize', 'fileSize']
  })

  return photos
}

const getAlbumsFromCameraRoll = async () => {
  const albums = await CameraRoll.getAlbums({
    // assetType: 'Photos',
    // assetType: 'Videos',
  })

  return albums
}

const getDriveUrl = (client, media) => {
  const createdAt = new Date(media.node.timestamp * 1000).toISOString()

  const toURL =
    client.getStackClient().uri +
    '/files/io.cozy.files.root-dir' +
    '?Name=' +
    encodeURIComponent(media.node.image.filename) +
    '&Type=file&Tags=library&Executable=false&CreatedAt=' +
    createdAt +
    '&UpdatedAt=' +
    createdAt

  return toURL
}

const logMedia = media => {
  console.log('')
  console.log('📷 filename : ' + media.node.image.filename)
  console.log('   type : ' + media.node.type)
  console.log('   uri : ' + media.node.image.uri)
  console.log('   extension : ' + media.node.image.extension)
  console.log('   fileSize : ' + media.node.image.fileSize)
  console.log(
    '   location : ' +
      media.node.location?.longitude +
      ', ' +
      media.node.location?.latitude
  )
  console.log('   date : ' + new Date(media.node.timestamp * 1000))
}

export const BackupPhotos = () => {
  const client = useClient()

  const [imageUri, setImageUri] = useState()

  const [numberOfMedias, setNumberOfMedias] = useState('1')

  const [shouldUpload, setShouldUpload] = useState(true)
  const toggleShouldUpload = () =>
    setShouldUpload(previousState => !previousState)

  useEffect(() => {
    ;(async () => {
      const albums = await getAlbumsFromCameraRoll()
      console.log('------ Albums ------')
      console.log(albums)
    })()
  }, [])

  const backupDispatcher = async backupName => {
    console.log('')
    console.log('####################')
    console.log(`### ${backupName} ###`)
    console.log('####################')
    console.log('')

    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      return
    }

    const medias = await getMediasFromCameraRoll(numberOfMedias)

    for (const media of medias.edges) {
      logMedia(media)

      switch (backupName) {
        case 'CameraRollgetImageDataRNFSuploadFiles':
          await CameraRollgetImageDataRNFSuploadFiles(media)
          break
        case 'RNFScopyAssetsRNFSuploadFiles':
          await RNFScopyAssetsRNFSuploadFiles(media)
          break
        case 'onlyFetch':
          await onlyFetch(media)
          break
        case 'RNFScopyAssetsRNBUstartUpload':
          await RNFScopyAssetsRNBUstartUpload(media)
          break
      }
    }
  }

  /*
    CameraRoll.getImageData + RNFS.uploadFiles

    iOS
      - photo      : 🟡 (on récupère que le JPEG éventuellement modifié même pour les HEIC)
      - live photo : 🟡 (on récupère que le JPEG éventuellement modifié)
      - video      : 🔴

    Android
      - photo      : 🟢
      - video      : 🟢
  */
  const CameraRollgetImageDataRNFSuploadFiles = async media => {
    let filepath

    if (Platform.OS === 'ios' && media.node.type === 'image') {
      const data = await CameraRoll.iosGetImageDataById(media.node.image.uri)
      filepath = data.node.image.filepath.replace('file://', '')
    } else if (Platform.OS === 'ios' && media.node.type === 'video') {
      // ne marche pas
      const data = await CameraRoll.iosGetImageDataById(media.node.image.uri)
      filepath = data.node.image.filepath.replace('file://', '')
    } else {
      filepath = media.node.image.uri.replace('file://', '')
    }

    console.log('   upload filepath: ' + filepath)

    setImageUri(filepath)

    if (!shouldUpload) {
      return
    }

    try {
      const res = await RNFS.uploadFiles({
        toUrl: getDriveUrl(client, media),
        files: [
          {
            name: media.node.image.filename,
            filename: media.node.image.filename,
            filepath
          }
        ],
        binaryStreamOnly: true,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type':
            Platform.OS === 'ios'
              ? `${media.node.type}/${media.node.image.extension}`
              : media.node.type,
          Authorization: 'Bearer ' + client.getStackClient().token.accessToken
        },
        begin: response => {
          var percentage =
            (response.totalBytesSent / response.totalBytesExpectedToSend) * 100
          console.log('UPLOAD IS ' + percentage + '% DONE!')
        },
        progress: response => {
          var percentage =
            (response.totalBytesSent / response.totalBytesExpectedToSend) * 100
          console.log('UPLOAD IS ' + percentage + '% DONE!')
        }
      }).promise

      if (res.statusCode === 201) {
        console.log(`✅ ${media.node.image.filename} uploaded !`)
      } else {
        const body = JSON.parse(res.body)
        console.log(`❌ ${media.node.image.filename} not uploaded !`)
        console.log(
          `   ${res.statusCode} : ${body.errors[0].title} ${body.errors[0].detail}`
        )
      }
    } catch (err) {
      console.log(err)
    }
  }

  /*
    RNFS.copyAssets + RNFS.uploadFiles

    iOS
      - photo      : 🟡 (fichier plus lourd, on récupère que le JPEG éventuellement modifié même pour les HEIC)
      - live photo : 🟡 (fichier plus lourd, on récupère que le JPEG)
      - video      : 🟢

    Android
      - photo      : 🟢
      - video      : 🟢
  */
  const RNFScopyAssetsRNFSuploadFiles = async media => {
    let filepath

    if (Platform.OS === 'ios' && media.node.type === 'image') {
      try {
        await RNFS.unlink(
          RNFS.TemporaryDirectoryPath + media.node.image.filename
        )
      } catch {}

      filepath = await RNFS.copyAssetsFileIOS(
        media.node.image.uri,
        RNFS.TemporaryDirectoryPath + media.node.image.filename,
        0,
        0
      )
    } else if (Platform.OS === 'ios' && media.node.type === 'video') {
      try {
        await RNFS.unlink(
          RNFS.TemporaryDirectoryPath + media.node.image.filename
        )
      } catch {}

      filepath = await RNFS.copyAssetsVideoIOS(
        media.node.image.uri,
        RNFS.TemporaryDirectoryPath + media.node.image.filename
      )
    } else {
      filepath = media.node.image.uri.replace('file://', '')
    }

    console.log('   upload filepath: ' + filepath)

    setImageUri(filepath)

    if (!shouldUpload) {
      return
    }

    try {
      const res = await RNFS.uploadFiles({
        toUrl: getDriveUrl(client, media),
        files: [
          {
            name: media.node.image.filename,
            filename: media.node.image.filename,
            filepath
          }
        ],
        binaryStreamOnly: true,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type':
            Platform.OS === 'ios'
              ? `${media.node.type}/${media.node.image.extension}`
              : media.node.type,
          Authorization: 'Bearer ' + client.getStackClient().token.accessToken
        },
        begin: response => {
          var percentage =
            (response.totalBytesSent / response.totalBytesExpectedToSend) * 100
          console.log('UPLOAD IS ' + percentage + '% DONE!')
        },
        progress: response => {
          var percentage =
            (response.totalBytesSent / response.totalBytesExpectedToSend) * 100
          console.log('UPLOAD IS ' + percentage + '% DONE!')
        }
      }).promise

      if (res.statusCode === 201) {
        console.log(`✅ ${media.node.image.filename} uploaded !`)
      } else {
        const body = JSON.parse(res.body)
        console.log(`❌ ${media.node.image.filename} not uploaded !`)
        console.log(
          `   ${res.statusCode} : ${body.errors[0].title} ${body.errors[0].detail}`
        )
      }
    } catch (err) {
      console.log(err)
    }
  }

  /*
    onlyFetch

    iOS
      - photo      : 🟡
      - live photo : 🟡
      - video      : 🟡

    Android
      - photo      : 🟡
      - video      : 🟡

    Tout est possible et notamment les liens ph:// si le serveur supporte le contenu en formData
  */
  const onlyFetch = async media => {
    let filepath

    filepath = media.node.image.uri

    console.log('   upload filepath: ' + filepath)

    setImageUri(filepath)

    if (!shouldUpload) {
      return
    }

    try {
      const data = new FormData()
      data.append('file', {
        name: media.node.image.filename,
        type:
          Platform.OS === 'ios'
            ? `${media.node.type}/${media.node.image.extension}`
            : media.node.type,
        uri: filepath
      })

      const res = await fetch(
        'https://d853-2a02-842a-230-4501-50cd-d2e7-b7c7-8ddc.ngrok-free.app/image',
        {
          method: 'POST',
          body: data,
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: 'Bearer ' + client.getStackClient().token.accessToken
          }
        }
      )

      console.log(res.status)
    } catch (err) {
      console.log(err)
    }
  }

  /*
    RNFS.copyAssets + RNBU.startUpload

    iOS
      - photo      : 🟡 (fichier plus lourd, on récupère que le JPEG éventuellement modifié même pour les HEIC)
      - live photo : 🟡 (fichier plus lourd, on récupère que le JPEG)
      - video      : 🔴

    Android
      - photo      : 🟢
      - video      : 🟢
  */
  const RNFScopyAssetsRNBUstartUpload = async media => {
    let filepath

    if (Platform.OS === 'ios' && media.node.type === 'image') {
      try {
        await RNFS.unlink(
          RNFS.TemporaryDirectoryPath + media.node.image.filename
        )
      } catch {}

      filepath =
        'file://' +
        (await RNFS.copyAssetsFileIOS(
          media.node.image.uri,
          RNFS.TemporaryDirectoryPath + media.node.image.filename,
          0,
          0
        ))
    } else if (Platform.OS === 'ios' && media.node.type === 'video') {
      try {
        await RNFS.unlink(
          RNFS.TemporaryDirectoryPath + media.node.image.filename
        )
      } catch {}

      filepath =
        'file://' +
        (await RNFS.copyAssetsVideoIOS(
          media.node.image.uri,
          RNFS.TemporaryDirectoryPath + media.node.image.filename
        ))
    } else {
      filepath = media.node.image.uri.replace('file://', '')
    }

    console.log('   upload filepath: ' + filepath)

    setImageUri(filepath)

    if (!shouldUpload) {
      return
    }

    try {
      const options = {
        url: getDriveUrl(client, media),
        path: filepath,
        method: 'POST',
        type: 'raw',
        headers: {
          Accept: 'application/json',
          'Content-Type':
            Platform.OS === 'ios'
              ? `${media.node.type}/${media.node.image.extension}`
              : media.node.type,
          Authorization: 'Bearer ' + client.getStackClient().token.accessToken
        },
        notification: {
          enabled: false
        }
      }

      RNBU.startUpload(options)
        .then(uploadId => {
          console.log('Upload started')
          RNBU.addListener('progress', uploadId, data => {
            console.log(`Progress: ${data.progress}%`)
          })
          RNBU.addListener('error', uploadId, data => {
            console.log(`Error!`)
            console.log(data)
          })
          RNBU.addListener('cancelled', uploadId, data => {
            console.log(`Cancelled!`)
            console.log(data)
          })
          RNBU.addListener('completed', uploadId, data => {
            // data includes responseCode: number and responseBody: Object
            console.log('Completed!')
            console.log(data)
          })
        })
        .catch(err => {
          console.log('Upload error!', err)
        })
    } catch (err) {
      console.log(err)
    }
  }

  if (!client) {
    return null
  }

  return (
    <>
      <Image
        style={{ width: 200, height: 200 }}
        source={{
          uri: Platform.OS === 'android' ? 'file://' + imageUri : imageUri
        }}
      />
      <View style={{ display: 'flex', flexDirection: 'row' }}>
        <Text>Number of medias :</Text>
        <TextInput
          style={styles.input}
          onChangeText={value => setNumberOfMedias(value)}
          value={numberOfMedias}
          keyboardType="numeric"
        />
        <Text>Upload :</Text>
        <Switch onValueChange={toggleShouldUpload} value={shouldUpload} />
      </View>
      <Button
        title="CameraRoll.getImageData + RNFS.uploadFiles"
        onPress={() =>
          backupDispatcher('CameraRollgetImageDataRNFSuploadFiles')
        }
      />
      <Button
        title="RNFS.copyAssets + RNFS.uploadFiles"
        onPress={() => backupDispatcher('RNFScopyAssetsRNFSuploadFiles')}
      />
      <Button title="fetch" onPress={() => backupDispatcher('onlyFetch')} />
      <Button
        title="RNFS.copyAssets + RNBU.startUpload"
        onPress={() => backupDispatcher('RNFScopyAssetsRNBUstartUpload')}
      />
    </>
  )
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderWidth: 1,
    width: 40
  }
})
