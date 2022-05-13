import ContentScript, { PILOT_TYPE } from './ContentScript'

describe('ContentScript', () => {
  const contentScript = new ContentScript()
  contentScript.setContentScriptType(PILOT_TYPE)

  describe('runInWorkerUntilTrue', () => {
    contentScript.runInWorker = jest.fn()
    contentScript.tocall = jest.fn()

    it('should resolve with result of the specified method returns truthy value', async () => {
      contentScript.runInWorker.mockResolvedValueOnce('result')
      const result = await contentScript.runInWorkerUntilTrue({
        method: 'tocall'
      })
      expect(result).toEqual('result')
    })
    it('should resolve only once the specified method returns truthy value', async () => {
      contentScript.runInWorker
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce('result last')
      const result = await contentScript.runInWorkerUntilTrue({
        method: 'tocall'
      })
      expect(result).toEqual('result last')
    })

    it('should reject when timeout is expired', async () => {
      contentScript.runInWorker.mockResolvedValue(false)
      await expect(
        contentScript.runInWorkerUntilTrue({ method: 'tocall', timeout: 1 })
      ).rejects.toThrow('Timeout error')
    })
  })
})
