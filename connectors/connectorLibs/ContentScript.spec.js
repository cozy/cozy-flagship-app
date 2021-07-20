import ContentScript from './ContentScript'

describe('ContentScript', () => {
  const contentScript = new ContentScript()

  describe('runInWorkerUntilTrue', () => {
    contentScript.runInWorker = jest.fn()
    contentScript.tocall = jest.fn()

    beforeEach(() => {
      contentScript.runInWorker.mockReset()
    })
    it('should resolve with result of the specified method returns truthy value', async () => {
      contentScript.runInWorker.mockResolvedValueOnce('result')
      const result = await contentScript.runInWorkerUntilTrue('tocall')
      expect(result).toEqual('result')
    })
    it('should resolve only once the specified method returns truthy value', async () => {
      contentScript.runInWorker
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce('result last')
      const result = await contentScript.runInWorkerUntilTrue('tocall')
      expect(result).toEqual('result last')
    })
  })
})
