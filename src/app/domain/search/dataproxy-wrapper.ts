// We cannot use `cozy-dataproxy-lib/api` here due to our bundler configuration
// even if it is declared in the package.json file. Instead we should target the
// 'dist' directory.
// In the future we should find a way to homogenize bundlers configuration.
export { SearchEngine } from 'cozy-dataproxy-lib/dist/api'
