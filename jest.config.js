const config = {
  setupFiles: ['<rootDir>/__tests__/jestSetupFile.js'],
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native(-.*)?|@react-native(-community)?)/)',
  ],
}

module.exports = config
