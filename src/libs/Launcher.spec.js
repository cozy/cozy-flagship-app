import Launcher from './Launcher'

jest.mock('./folder')

describe('Launcher', () => {
  describe('ensureAccountTriggerAndLaunch', () => {
    it('should not remove startContext attributes', async () => {
      const launcher = new Launcher()
      const account = {
        _id: 'testaccount'
      }
      const trigger = { _id: 'testtrigger' }
      const job = { _id: 'testjob' }
      const client = {}
      const konnector = {}
      const launcherClient = {
        setAppMetadata: () => null
      }
      launcher.ensureAccountName = jest.fn().mockResolvedValue(account)
      launcher.setStartContext({
        client,
        konnector,
        account,
        trigger,
        job,
        manifest: { name: 'konnector' },
        launcherClient
      })

      await launcher.ensureAccountTriggerAndLaunch()
      expect(launcher.getStartContext()).toStrictEqual({
        account,
        trigger,
        job,
        client,
        konnector,
        manifest: { name: 'konnector' },
        launcherClient
      })
    })
  })
})
