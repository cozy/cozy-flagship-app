const webpack = require('webpack')
const HookShellScriptPlugin = require('hook-shell-script-webpack-plugin');
module.exports = {
  mode: 'none',
  plugins: [
    new HookShellScriptPlugin({
      afterCompile: ['node scripts/generateWebViewContentScript.js']
    })
  ]
}
