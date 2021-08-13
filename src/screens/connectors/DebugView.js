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
    getConnectorsFiles().then(async (connectors) => {
      for (const connector in connectors) {
        result += `<h2>${connector}</h2>
          <ul>`
        for (const file of connectors[connector].files) {
          const size = Math.floor(file.size / 1024) + 'kB'
          let version
          if (file.name === 'VERSION') {
            version = connectors[connector].version
          }
          result += `<li>${file.name} ${version ? version : size}</li>`
        }
        result += '</ul>'
      }
      setContent(result)
    })
  }, [content])
  return (
    <>
      <WebView source={{html: content}} />
      <Button title="Clean" onPress={() => cleanDirectory(setContent)} />
    </>
  )
}

async function cleanDirectory(setContent) {
  try {
    await cleanConnectorsFiles()
    setContent('<h1>Cleaned</h1>')
  } catch (err) {
    console.error(err)
    setContent(`<h1>Not Cleaned: ${err.message}</h1>`)
  }
}

export default DebugView
