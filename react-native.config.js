module.exports = {
  dependencies: {
    'react-native-document-scanner': {
      platforms: {
        android: {
          packageImportPath:
            'import com.documentscanner.DocumentScannerPackage;',
          packageInstance: 'new DocumentScannerPackage()',
        },
        // add more platform to disable auto-linking for them too
      },
    },
    'react-native-perspective-image-cropper': {
      platforms: {
        android: null,
        // add more platform to disable auto-linking for them too
      },
    },
  },
}
