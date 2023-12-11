// eslint-disable-next-line import/no-extraneous-dependencies -- We rely on react-native here
const { getDefaultConfig } = require('metro-config')

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts }
  } = await getDefaultConfig()

  if (process.env.STORYBOOK_ENABLED) {
    return {
      transformer: {
        getTransformOptions: async () => ({
          transform: {
            experimentalImportSupport: false,
            inlineRequires: false
          }
        })
      },
      resolver: {
        resolverMainFields: ['sbmodern', 'react-native', 'browser', 'main'],
        // We do a little bit of tomfoolery and pick *.storybook.js instead of *.js files (if available)
        // (this is how metro 'prefers' .android.js or .ios.js files)
        sourceExts: ['storybook.js'].concat(sourceExts)
      }
    }
  }

  return {
    transformer: {
      experimentalImportSupport: false,
      inlineRequires: true,
      babelTransformerPath: require.resolve('react-native-svg-transformer')
    },
    resolver: {
      assetExts: assetExts.filter(ext => ext !== 'svg'),
      sourceExts: [...sourceExts, 'jsx', 'svg']
    }
  }
})()
