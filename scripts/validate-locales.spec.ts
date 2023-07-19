import fs from 'fs'

import { validateLocales } from './validate-locales'

jest.mock('fs')

const mockReadFileSync = fs.readFileSync as jest.Mock

describe('Locale Validation', () => {
  let stdoutSpy: jest.SpyInstance

  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation()
  })

  afterEach(() => {
    stdoutSpy.mockRestore()
  })

  test('should log an error when a key is missing', () => {
    mockReadFileSync
      .mockReturnValueOnce(
        JSON.stringify({ key1: 'value1', key2: { nestedKey: 'nestedValue' } })
      )
      .mockReturnValueOnce(JSON.stringify({ key1: 'value1' }))

    validateLocales('en', ['fr'])
    expect(stdoutSpy).toHaveBeenCalledWith(
      '::warning::Error: fr/translate.json is missing key key2 present in en/translate.json\n'
    )
  })

  test('should log an error when a nested key is missing', () => {
    mockReadFileSync
      .mockReturnValueOnce(
        JSON.stringify({ key1: 'value1', key2: { nestedKey: 'nestedValue' } })
      )
      .mockReturnValueOnce(
        JSON.stringify({
          key1: 'value1',
          key2: { otherNestedKey: 'nestedValue' }
        })
      )

    validateLocales('en', ['fr'])
    expect(stdoutSpy).toHaveBeenCalledWith(
      '::warning::Error: fr/translate.json is missing key key2.nestedKey present in en/translate.json\n'
    )
  })

  test('should log an error when a value is empty', () => {
    mockReadFileSync
      .mockReturnValueOnce(
        JSON.stringify({ key1: 'value1', key2: { nestedKey: 'nestedValue' } })
      )
      .mockReturnValueOnce(
        JSON.stringify({ key1: '', key2: { nestedKey: 'nestedValue' } })
      )

    validateLocales('en', ['fr'])

    expect(stdoutSpy).toHaveBeenCalledWith(
      '::warning::Error: fr/translate.json has an empty string for key: key1\n'
    )
  })

  test('should multiples errors when a value is empty and a label is missing', () => {
    mockReadFileSync
      .mockReturnValueOnce(
        JSON.stringify({ key1: 'value1', key2: { nestedKey: 'nestedValue' } })
      )
      .mockReturnValueOnce(JSON.stringify({ key1: '' }))

    validateLocales('en', ['fr'])
    expect(stdoutSpy).toHaveBeenNthCalledWith(
      1,
      '::warning::Error: fr/translate.json has an empty string for key: key1\n'
    )
    expect(stdoutSpy).toHaveBeenNthCalledWith(
      2,
      '::warning::Error: fr/translate.json is missing key key2 present in en/translate.json\n'
    )
  })

  test('should not log an error when all keys and values match', () => {
    mockReadFileSync
      .mockReturnValueOnce(
        JSON.stringify({ key1: 'value1', key2: { nestedKey: 'nestedValue' } })
      )
      .mockReturnValueOnce(
        JSON.stringify({ key1: 'value1', key2: { nestedKey: 'nestedValue' } })
      )

    validateLocales('en', ['fr'])
    expect(stdoutSpy).not.toHaveBeenCalled()
  })
})
