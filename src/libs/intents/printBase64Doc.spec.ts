import RNPrint from 'react-native-print'
import Toast from 'react-native-toast-message'

import { printBase64Doc } from '/libs/intents/printBase64Doc'

jest.mock('react-native-print', () => ({ print: jest.fn() }))
jest.mock('react-native-toast-message', () => ({ show: jest.fn() }))
const mockRNPrint = RNPrint as jest.Mocked<typeof RNPrint>
const mockToast = Toast as jest.Mocked<typeof Toast>
const mockBase64Pdf = `data:application/pdf;base64,foo`
const mockBase64Jpeg = `data:image/jpeg;base64,bar`

describe('printBase64Doc Functionality', () => {
  beforeEach(() => {
    mockRNPrint.print.mockClear()
  })

  it('should correctly handle and verify a valid base64 PDF file', async () => {
    await printBase64Doc(mockBase64Pdf)

    const filePath = (
      mockRNPrint.print.mock.calls[0][0] as { filePath: string }
    ).filePath

    // Hard to test the file content while staying in an unit test scope,
    // so we just check the file extension instead
    expect(filePath).toContain('.pdf')
    expect(mockRNPrint.print).toHaveBeenCalledTimes(1)
  })

  it('should correctly handle and verify a valid base64 JPEG file', async () => {
    await printBase64Doc(mockBase64Jpeg)

    const filePath = (
      mockRNPrint.print.mock.calls[0][0] as { filePath: string }
    ).filePath

    expect(filePath).toContain('.jpeg')
    expect(mockRNPrint.print).toHaveBeenCalledTimes(1)
  })

  it('should call the Toast.show function with the correct parameters if an error occurs', async () => {
    const invalidBase64String = 'invalidBase64String'

    await printBase64Doc(invalidBase64String)

    expect(mockToast.show).toHaveBeenCalledTimes(1)
    expect(mockToast.show).toHaveBeenCalledWith({
      type: 'error',
      text1: expect.any(String) as string // We don't care about the exact error message
    })
    expect(mockRNPrint.print).toHaveBeenCalledTimes(0)
  })
})
