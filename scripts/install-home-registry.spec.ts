import fs from 'fs-extra'
import nock from 'nock'

import { installHomeRegistry } from './install-home-registry'

const scope = nock('https://test.url')

afterEach(() => {
  nock.cleanAll()

  fs.emptydirSync('__tests__/install-home-registry')
})

it('should install cozy-home from the registry', async () => {
  scope.get('/').replyWithFile(200, '__tests__/fixtures/registry.json')

  scope
    .get('/cozy-home.tar.gz')
    .replyWithFile(200, '__tests__/fixtures/cozy-home.tar.gz')

  await installHomeRegistry('https://test.url', [
    '__tests__/install-home-registry/android',
    '__tests__/install-home-registry/ios'
  ])

  expect(
    await fs.readdir(
      '__tests__/install-home-registry/android/fixtures/cozy-home'
    )
  ).toEqual(['bar.foo', 'foo.bar'])

  expect(
    await fs.readdir('__tests__/install-home-registry/ios/fixtures/cozy-home')
  ).toEqual(['bar.foo', 'foo.bar'])
})

it("should fail if the cozy-home url can't be retrieved", async () => {
  scope.get('/').replyWithError('no registry')

  await expect(
    installHomeRegistry('https://test.url', [
      '__tests__/install-home-registry/android',
      '__tests__/install-home-registry/ios'
    ])
  ).rejects.toThrow('no registry')

  await expect(
    fs.readdir('__tests__/install-home-registry/android/fixtures/cozy-home')
  ).rejects.toThrow('ENOENT')

  await expect(
    fs.readdir('__tests__/install-home-registry/ios/fixtures/cozy-home')
  ).rejects.toThrow('ENOENT')
})

it("should fail if the cozy-home tarball can't be retrieved", async () => {
  scope.get('/').replyWithFile(200, '__tests__/fixtures/registry.json')

  scope.get('/cozy-home.tar.gz').replyWithError('no tarball')

  await expect(
    installHomeRegistry('https://test.url', [
      '__tests__/install-home-registry/android',
      '__tests__/install-home-registry/ios'
    ])
  ).rejects.toThrow('no tarball')

  await expect(
    fs.readdir('__tests__/install-home-registry/android/fixtures/cozy-home')
  ).rejects.toThrow('ENOENT')

  await expect(
    fs.readdir('__tests__/install-home-registry/ios/fixtures/cozy-home')
  ).rejects.toThrow('ENOENT')
})
