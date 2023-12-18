// eslint-disable-next-line import/no-extraneous-dependencies
const { getDefaultConfig } = require('metro-config')

const transformerConfig = {
  transformer: {
    experimentalImportSupport: false,
    inlineRequires: true,
    babelTransformerPath: require.resolve('react-native-svg-transformer')
  }
}

const getDefaultResolverConfig = (sourceExts, assetExts) => ({
  assetExts: assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...sourceExts, 'jsx', 'svg']
})

const getStorybookResolverConfig = sourceExts => ({
  resolverMainFields: ['sbmodern', 'react-native', 'browser', 'main'],
  sourceExts: ['storybook.js', ...sourceExts]
})

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig()
  const {
    resolver: { sourceExts, assetExts }
  } = defaultConfig

  const resolverConfig = process.env.STORYBOOK_ENABLED
    ? getStorybookResolverConfig(sourceExts)
    : getDefaultResolverConfig(sourceExts, assetExts)

  return {
    ...transformerConfig,
    resolver: resolverConfig
  }
})()
