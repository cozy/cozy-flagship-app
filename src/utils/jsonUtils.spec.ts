import { diffJsonStructure, getJsonStructureFlat } from '/utils/jsonUtils'

describe('getJsonStructureFlat', () => {
  it('Should return flat object', () => {
    const object = {
      item1: 'foo',
      item2: 1,
      item3: {
        subItem: 'bar'
      }
    }

    const result = getJsonStructureFlat(object)

    expect(result).toStrictEqual(['item1', 'item2', 'item3.subItem'])
  })
})

describe('diffJsonStructure', () => {
  it('Should return items that are in first JSON but not in second one', () => {
    const firstJson = {
      item1: 'foo'
    }

    const secondJson = {}

    const result = diffJsonStructure(firstJson, secondJson)

    expect(result).toStrictEqual({
      notIn1: [],
      notIn2: ['item1']
    })
  })

  it('Should return items that are in second JSON but not in first one', () => {
    const firstJson = {}

    const secondJson = {
      item1: 'foo'
    }

    const result = diffJsonStructure(firstJson, secondJson)

    expect(result).toStrictEqual({
      notIn1: ['item1'],
      notIn2: []
    })
  })

  it('Should return items that are in one of the JSON items but not in the other', () => {
    const firstJson = {
      onlyInFirst: 'foo',
      inBoth: 'both'
    }

    const secondJson = {
      onlyInSecond: 'bar',
      inBoth: 'both'
    }

    const result = diffJsonStructure(firstJson, secondJson)

    expect(result).toStrictEqual({
      notIn1: ['onlyInSecond'],
      notIn2: ['onlyInFirst']
    })
  })

  it('Should handle sub items', () => {
    const firstJson = {
      item1: 'foo',
      item2: 1,
      item3: {
        subItem: 'bar'
      }
    }

    const secondJson = {
      item1: 'foo',
      item2: 1,
      item3: {}
    }

    const result = diffJsonStructure(firstJson, secondJson)

    expect(result).toStrictEqual({
      notIn1: [],
      notIn2: ['item3.subItem']
    })
  })
})
