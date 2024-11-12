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
          'pouchdb-collate': '@craftzdog/pouchdb-collate-react-native',
          crypto: 'react-native-quick-crypto',
          stream: 'readable-stream',
          buffer: '@craftzdog/react-native-buffer',
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
