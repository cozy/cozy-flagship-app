module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'optional-require',
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '^/(.+)': './src/\\1',
          '@cozy/minilog': 'cozy-minilog'
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
