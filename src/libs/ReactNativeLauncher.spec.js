jest.mock('react-native-fs', () => {
  return {}
})
jest.mock('@fengweichong/react-native-gzip', () => {
  return {}
})

import ReactNativeLauncher from './ReactNativeLauncher'

const fixtures = {
  job: { _id: 'normal_job_id' },
  account: { _id: 'normal_account_id' },
  trigger: {
    _id: 'normal_trigger_id',
    message: { folder_to_save: 'normalfolderid' }
  }
}

describe('ReactNativeLauncher', () => {
  const launcher = new ReactNativeLauncher()
  launcher.pilot = {
    call: jest.fn()
  }
  launcher.worker = {
    call: jest.fn()
  }
  const updateAttributes = jest.fn()
  const client = {
    save: jest.fn(),
    query: jest.fn(),
    collection: () => ({
      updateAttributes
    })
  }

  describe('start', () => {
    it('should work normaly in nominal case', async () => {
      launcher.setStartContext({
        client,
        job: fixtures.job,
        account: fixtures.account,
        trigger: fixtures.trigger
      })
      client.query.mockResolvedValue({ data: fixtures.account })
      launcher.pilot.call
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce({
          sourceAccountIdentifier: 'testsourceaccountidentifier'
        })
      await launcher.start()
      expect(client.save).toHaveBeenNthCalledWith(1, {
        _id: 'normal_account_id',
        state: 'LOGIN_SUCCESS'
      })
      expect(client.save).toHaveBeenNthCalledWith(2, {
        _id: 'normal_account_id',
        auth: {
          accountName: 'testsourceaccountidentifier'
        }
      })
      expect(client.save).toHaveBeenNthCalledWith(3, {
        _id: 'normal_job_id',
        attributes: {
          state: 'done'
        }
      })
      expect(launcher.pilot.call).toHaveBeenNthCalledWith(
        1,
        'setContentScriptType',
        'pilot'
      )
      expect(launcher.pilot.call).toHaveBeenNthCalledWith(
        2,
        'ensureAuthenticated'
      )
      expect(launcher.pilot.call).toHaveBeenNthCalledWith(
        3,
        'getUserDataFromWebsite'
      )
      expect(launcher.pilot.call).toHaveBeenNthCalledWith(4, 'fetch', [])
      expect(updateAttributes).toHaveBeenNthCalledWith(1, 'normalfolderid', {
        name: 'testsourceaccountidentifier'
      })
    })
    it('should update job with error message on error', async () => {
      launcher.setStartContext({
        client,
        job: fixtures.job,
        account: fixtures.account,
        trigger: fixtures.trigger
      })
      client.query.mockResolvedValue({ data: fixtures.account })
      launcher.pilot.call.mockRejectedValue(new Error('test error message'))
      await launcher.start()
      expect(client.save).toHaveBeenNthCalledWith(1, {
        _id: 'normal_job_id',
        attributes: {
          state: 'errored',
          error: 'test error message'
        }
      })
    })
  })
  describe('runInWorker', () => {
    it('should resolve with method result', async () => {
      launcher.worker.call.mockResolvedValue('worker result')
      const result = await launcher.runInWorker('toRunInworker')
      expect(launcher.worker.call).toHaveBeenCalledTimes(1)
      expect(result).toEqual('worker result')
    })
    it('should return false WORKER_WILL_RELOAD event is emitted', async () => {
      launcher.worker.call.mockImplementation(async () => {
        launcher.emit('WORKER_WILL_RELOAD')
        launcher.emit('WORKER_RELOADED')
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      const result = await launcher.runInWorker('toRunInworker')
      expect(result).toEqual(false)
    })
  })
})
