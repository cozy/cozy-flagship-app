import React, {useState, useEffect} from 'react'
import {Button} from 'react-native'
import {WebView} from 'react-native-webview'
import {
  getConnectorsFiles,
  cleanConnectorsFiles,
} from '../../libs/ConnectorInstaller'

const DebugView = (props) => {
  const [content, setContent] = useState('<h1>loading...</h1>')
  useEffect(() => {
    let result = '<h1>Installed connectors</h1>'
    getConnectorsFiles().then((connectors) => {
      for (const connector in connectors) {
        result += `<h2>${connector}</h2>
          <ul>`
        for (const file of connectors[connector]) {
          result += `<li>${file.name} ${Math.floor(file.size / 1024)} kB</li>`
        }
        result += '</ul>'
      }
      setContent(result)
    })
  })
  return (
    <>
      <WebView source={{html: content}} />
      <Button title="Clean" onPress={() => cleanDirectory(setContent)} />
    </>
  )
}

async function cleanDirectory(setContent) {
  await cleanConnectorsFiles()
  setContent('<h1>Cleaned</h1>')
}

export default DebugView
