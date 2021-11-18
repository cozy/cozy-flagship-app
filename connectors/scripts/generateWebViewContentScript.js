const fs = require('fs')
const path = require('path')

const [BASE_PATH] = process.argv.slice(2)
const SOURCE_PATH = path.join(BASE_PATH, 'dist/main.js')
const OUT_PATH = path.join(BASE_PATH, 'dist/webviewScript.js')
const MANIFEST_PATH = path.join(BASE_PATH, 'manifest.konnector')

const js = fs.readFileSync(SOURCE_PATH, 'utf8')
const manifest = fs.readFileSync(MANIFEST_PATH, 'utf8')
const json = `module.exports = {
  content: ${JSON.stringify(js)},
  manifest: ${manifest.trim()}
}`
fs.writeFileSync(OUT_PATH, json)
console.log('Generated ' + OUT_PATH)
