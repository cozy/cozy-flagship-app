module.exports = {
  extends: ['@react-native-community', 'cozy-app/react'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        arrowParens: 'avoid',
        endOfLine: 'auto',
        semi: false,
        singleQuote: true,
        trailingComma: 'none'
      }
    ],
    'spaced-comment': ['error', 'always', { block: { exceptions: ['*'] } }]
  }
}
