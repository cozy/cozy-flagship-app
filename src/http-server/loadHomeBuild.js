import RNFS from 'react-native-fs'

export const loadHomeBuild = async () => {
  return 'ok'
}

export const loadHomeBuild2 = async () => {
  const HOME_DOCUMENT_DIR_PATH = RNFS.DocumentDirectoryPath + '/home/'

  RNFS.readDir(RNFS.MainBundlePath)
    .then(result => {
      console.log('GOT RESULT', result)

      // stat the first file
      return Promise.all([RNFS.stat(result[0].path), result[0].path])
    })
    .then(statResult => {
      if (statResult[0].isFile()) {
        // if we have a file, read it
        return RNFS.readFile(statResult[1], 'utf8')
      }

      return 'no file'
    })
    .then(contents => {
      // log the file contents
      console.log(contents)
    })
    .catch(err => {
      console.log(err.message, err.code)
    })

  // await RNFS.readFile('../../../cozy-home/build/index.html')

  // return (
  //   fetch('../../../cozy-home/build/index.html')
  //     // return fetch('/')
  //     .then(function (response) {
  //       console.log('response ❌❌❌❌❌❌')
  //       console.log({response})
  //
  //       // When the page is loaded convert it to text
  //       return response.text()
  //     })
  //     .then(function (html) {
  //       // Initialize the DOM parser
  //       var parser = new DOMParser()
  //
  //       // Parse the text
  //       var doc = parser.parseFromString(html, 'text/html')
  //
  //       // You can now even select part of that html as you would in the regular DOM
  //       // Example:
  //       // var docArticle = doc.querySelector('article').innerHTML;
  //
  //       console.log(doc)
  //     })
  //     .catch(function (err) {
  //       console.log('Failed to fetch page: ', err)
  //     })
  // )
}
