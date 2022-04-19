const config = {
  setupFiles: ['<rootDir>/__tests__/jestSetupFile.js'],
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native(-.*)?|@react-native(-community)?)/)'
  ],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}']
}

module.exports = config
