module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'optional-require',
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '^/(.+)': './src/\\1',
          '@cozy/minilog': 'cozy-minilog',
          CozyGPSMemory: './CozyGPSMemory'
        },
        extensions: [
          '.ios.js',
          '.android.js',
          '.js',
          '.jsx',
          '.json',
          '.tsx',
          '.ts',
          '.native.js'
        ]
      }
    ]
  ]
}
