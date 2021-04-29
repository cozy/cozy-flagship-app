const {execSync} = require('child_process')
const {name, domain} = require('../config.json')
const path = require('path')

const finalPath = path.resolve(__dirname, '..', 'token.json')

const cozy = name + '.' + domain
const cmd = `make-token ${cozy} io.cozy.files | xargs -I{} cp {} ${finalPath}`
console.log(cmd + '...')
execSync(cmd)
console.log(`  Generated token for ${cozy} in ${finalPath}`)
