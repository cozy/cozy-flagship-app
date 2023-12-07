const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')

const {
  resolver: { sourceExts, assetExts }
} = getDefaultConfig()

const transformerConfig = {
  transformer: {
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

const resolverConfig = process.env.STORYBOOK_ENABLED
  ? getStorybookResolverConfig(sourceExts)
  : getDefaultResolverConfig(sourceExts, assetExts)

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  ...transformerConfig,
  resolver: resolverConfig
}

module.exports = mergeConfig(getDefaultConfig(__dirname), config)
