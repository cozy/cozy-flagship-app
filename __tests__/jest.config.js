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
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.(jpg|jpeg|png|gif|webp|svg)$':
      '<rootDir>/__tests__/transformer/imageTransformer.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native(-.*)?|@react-navigation|@react-native(-community)?|p-timeout?|p-wait-for?|@notifee?)|@fengweichong/react-native-gzip|@craftzdog/*?/)'
  ],
  rootDir: '../'
}

module.exports = config
