const fs = require('fs')
const path = require('path')

const SOURCE_PATH = path.join(__dirname, '..', 'dist/main.js')
const OUT_PATH = path.join(__dirname, '..', 'dist/webviewScript.js')
const MANIFEST_PATH = path.join(__dirname, '..', 'manifest.konnector')

const js = fs.readFileSync(SOURCE_PATH, 'utf8')
const manifest = fs.readFileSync(MANIFEST_PATH, 'utf8')
const json = `module.exports = {
  source: ${JSON.stringify(js)},
  manifest: ${manifest.trim()}
}`
fs.writeFileSync(OUT_PATH, json)
console.log('Generated ' + OUT_PATH)


