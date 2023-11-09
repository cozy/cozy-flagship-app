import _ from 'lodash'

export const getJsonStructureFlat = (
  object: Record<string, unknown>,
  parent = ''
): string[] => {
  const result = Object.entries(object).flatMap(([key, value]) => {
    if (typeof value === 'object') {
      return getJsonStructureFlat(value as Record<string, unknown>, `${key}.`)
    }
    return `${parent}${key}`
  })

  return result
}

interface JsonStructureDiff {
  notIn1: string[]
  notIn2: string[]
}

export const diffJsonStructure = (
  json1: Record<string, unknown>,
  json2: Record<string, unknown>
): JsonStructureDiff => {
  const json1Flat = getJsonStructureFlat(json1)
  const json2Flat = getJsonStructureFlat(json2)

  const notIn1 = _.difference(json2Flat, json1Flat)
  const notIn2 = _.difference(json1Flat, json2Flat)

  return {
    notIn1,
    notIn2
  }
}
