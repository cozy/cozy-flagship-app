const {execSync} = require('child_process')
const {domain, folder} = require('../config.json')
const path = require('path')

const finalPath = path.resolve(__dirname, '..', 'token.json')

execSync(`make-token ${domain} io.cozy.files | xargs -I{} cp {} ${finalPath}`)
console.log(`Generated token for ${domain} in ${finalPath}`)
