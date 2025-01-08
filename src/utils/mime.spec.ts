import { getMime } from './mime'

describe('getMime', () => {
  it('should return correct mime', () => {
    expect(getMime('file.txt')).toEqual('text/plain')
    expect(getMime('txt')).toEqual('text/plain')
    expect(getMime('fkjqhdsfnvbqs')).toEqual(null)
  })
})
