module.exports = {
  extends: ['@react-native-community', 'cozy-app/react'],
  plugins: ['react-hooks'],
  rules: {
    'no-shadow': 'error',
    'no-unused-vars': [
      'error',
      { vars: 'all', args: 'after-used', ignoreRestSiblings: false }
    ],
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
    'react-hooks/exhaustive-deps': 'error',
    'react-native/no-inline-styles': 'error',
    'spaced-comment': ['error', 'always', { block: { exceptions: ['*'] } }]
  }
}
