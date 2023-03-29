/* eslint-disable @typescript-eslint/unbound-method */
import CozyClient from 'cozy-client'

import { cleanExistingAccountsForKonnector } from './Launcher.functions'

const client = {
  query: jest.fn(),
  destroy: jest.fn()
} as Partial<CozyClient> as jest.Mocked<CozyClient>

beforeEach(() => {
  jest.resetAllMocks()
})

it('should clean existing accounts for konnector', async () => {
  const konnectorSlug = 'test'
  const accounts = [
    {
      _id: '1',
      _type: 'io.cozy.accounts',
      accountType: konnectorSlug
    },
    {
      _id: '2',
      _type: 'io.cozy.accounts',
      accountType: konnectorSlug
    }
  ]
  client.query.mockResolvedValueOnce({ data: accounts })
  await cleanExistingAccountsForKonnector(client, konnectorSlug)
  expect(client.query).toHaveBeenCalledWith(
    expect.objectContaining({
      selector: {
        accountType: konnectorSlug
      }
    })
  )
  expect(client.destroy).toHaveBeenCalledTimes(2)
  expect(client.destroy).toHaveBeenCalledWith(accounts[0])
  expect(client.destroy).toHaveBeenCalledWith(accounts[1])
})

it('should do nothing if no accounts', async () => {
  const konnectorSlug = 'test'
  client.query.mockResolvedValueOnce({ data: [] })
  await cleanExistingAccountsForKonnector(client, konnectorSlug)
  expect(client.query).toHaveBeenCalledWith(
    expect.objectContaining({
      selector: {
        accountType: konnectorSlug
      }
    })
  )
  expect(client.destroy).not.toHaveBeenCalled()
})
