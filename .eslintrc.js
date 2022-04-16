module.exports = {
  root: true,
  extends: ['@react-native-community', 'cozy-app/react'],
  rules: {
    'spaced-comment': ['error', 'always', {block: {exceptions: ['*']}}],
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
  },
}
