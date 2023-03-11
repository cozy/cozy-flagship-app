module.exports = {
  root: true,
  extends: 'cozy-app/react',
  globals: {
    __DEV__: 'readonly'
  },
  parserOptions: {
    project: 'tsconfig.json'
  }
}
