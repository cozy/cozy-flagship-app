import ContentScript, { PILOT_TYPE, WORKER_TYPE } from './ContentScript'

// const normalizeFileName = require('./ContentScript')
import { normalizeFileName } from './ContentScript'

describe('ContentScript', () => {
  describe('runInWorkerUntilTrue', () => {
    const contentScript = new ContentScript()
    contentScript.setContentScriptType(PILOT_TYPE)
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
  describe('normalizeFileName', () => {
    const contentScript = new ContentScript()
    contentScript.setContentScriptType(WORKER_TYPE)
    it('should return a filename with the minimum required infos', () => {
      const filenameInfos = {
        year: '2022',
        month: '05',
        vendor: 'SOMEVENDORNAME'
      }
      const result = contentScript.normalizeFileName(filenameInfos)
      expect(result).toBe('2022-05_SOMEVENDORNAME.pdf')
    })
    it('should return a basic filename with an added day value if present', () => {
      const filenameInfos = {
        year: '2022',
        month: '05',
        day: '14',
        vendor: 'SOMEVENDORNAME'
      }
      const result = contentScript.normalizeFileName(filenameInfos)
      expect(result).toBe('2022-05-14_SOMEVENDORNAME.pdf')
    })
    it('should return a basic filename with an added documentType value if present', () => {
      const filenameInfos = {
        year: '2022',
        month: '05',
        day: '14',
        vendor: 'SOMEVENDORNAME',
        documentType: 'contract'
      }
      const result = contentScript.normalizeFileName(filenameInfos)
      expect(result).toBe('2022-05-14_SOMEVENDORNAME_contract.pdf')
    })
    it('should return a basic filename with an added amount value if present', () => {
      const filenameInfos = {
        year: '2022',
        month: '05',
        day: '14',
        vendor: 'SOMEVENDORNAME',
        amount: 22.36
      }
      const result = contentScript.normalizeFileName(filenameInfos)
      expect(result).toBe('2022-05-14_SOMEVENDORNAME_22.36EUR.pdf')
    })
    it('should return a basic filename with an added vendorRef value if present', () => {
      const filenameInfos = {
        year: '2022',
        month: '05',
        day: '14',
        vendor: 'SOMEVENDORNAME',
        vendorRef: 'SOME-VENDOR-REF'
      }
      const result = contentScript.normalizeFileName(filenameInfos)
      expect(result).toBe('2022-05-14_SOMEVENDORNAME_SOME-VENDOR-REF.pdf')
    })
    it('should return a basic filename with an added documentType, an amount and a vendorRef values if present', () => {
      const filenameInfos = {
        year: '2022',
        month: '05',
        day: '14',
        vendor: 'SOMEVENDORNAME',
        documentType: 'contract',
        amount: 22.36,
        vendorRef: 'SOME-VENDOR-REF'
      }
      const result = contentScript.normalizeFileName(filenameInfos)
      expect(result).toBe(
        '2022-05-14_SOMEVENDORNAME_contract_22.36EUR_SOME-VENDOR-REF.pdf'
      )
    })
    it('should throw an error if some basic infos are missing', () => {
      const filenameInfos = {
        year: '2022',
        day: '14',
        vendor: 'SOMEVENDORNAME',
        amount: 22.36,
        vendorRef: 'SOME-VENDOR-REF'
      }
      expect(() => {
        contentScript.normalizeFileName(filenameInfos)
      }).toThrow(
        'Some date properties or vendor are missing, cannot complete filename normalization'
      )
    })
  })
})
