const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const { name, domain } = require('../config.json')

const finalPath = path.resolve(__dirname, '..', 'token.json')

const cozy = name + '.' + domain
const cmd = `make-token-konnector ${cozy} template | xargs -I{} cp {} ${finalPath}`
// eslint-disable-next-line no-console
console.log(cmd + '...')
execSync(cmd)
const tokenJSON = require(finalPath)
tokenJSON.url = 'https://' + cozy
fs.writeFileSync(finalPath, JSON.stringify(tokenJSON, null, 2))
// eslint-disable-next-line no-console
console.log(`  Generated token for ${cozy} in ${finalPath}`)
