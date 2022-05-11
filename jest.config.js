const config = {
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  preset: 'react-native',
  setupFiles: ['<rootDir>/__tests__/jestSetupFile.js'],
  transform: { '^.+\\.jsx$': 'babel-jest' },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native(-.*)?|@react-native(-community)?)/)'
  ]
}

module.exports = config
