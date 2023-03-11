const config = {
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  moduleNameMapper: {
    '^/(.*)$': '<rootDir>/src/$1'
  },
  preset: 'react-native',
  setupFiles: ['<rootDir>/__tests__/jestSetupFile.js'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { diagnostics: { exclude: ['**'] } }],
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native(-.*)?|@react-native(-community)?)/)'
  ],
  rootDir: '../'
}

module.exports = config
