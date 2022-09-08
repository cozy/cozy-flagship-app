import { StorageKeys, storeData } from '/libs/localStore/storage'
import { makeBiometryInjection } from '/libs/intents/setBiometryState'

it('should not throw with a null hasBiometry', async () => {
  const result = await makeBiometryInjection()
  expect(result).toStrictEqual('window.cozy.flagship.hasBiometry = false;')
})

it('should handle true value', async () => {
  await storeData(StorageKeys.BiometryActivated, true)
  const result = await makeBiometryInjection()
  expect(result).toStrictEqual('window.cozy.flagship.hasBiometry = true;')
})

it('should handle truthy value', async () => {
  await storeData(StorageKeys.BiometryActivated, 'true')
  const result = await makeBiometryInjection()
  expect(result).toStrictEqual('window.cozy.flagship.hasBiometry = true;')
})

it('should handle false value', async () => {
  await storeData(StorageKeys.BiometryActivated, false)
  const result = await makeBiometryInjection()
  expect(result).toStrictEqual('window.cozy.flagship.hasBiometry = false;')
})

it('should handle falsy value', async () => {
  await storeData(StorageKeys.BiometryActivated, '')
  const result = await makeBiometryInjection()
  expect(result).toStrictEqual('window.cozy.flagship.hasBiometry = false;')
})
