import Minilog from '@cozy/minilog'
import get from 'lodash/get'

const log = Minilog('Utils')

export function convertResidenceType(residenceType) {
  const residenceTypeMap = {
    Principale: 'primary',
    Secondaire: 'secondary',
  }
  const result = residenceTypeMap[residenceType]

  if (!result) {
    log.warn('unknown residence type : ' + residenceType)
  }
  return result
}

export function convertHousingType(housingType) {
  const housingTypeMap = {
    Appartement: 'appartment',
    Maison: 'house',
  }
  const result = housingTypeMap[housingType]

  if (!result) {
    log.warn('unknown housing type : ' + housingType)
  }
  return result
}

export function convertHeatingSystem(heatingSystem) {
  const heatingSystemMap = {
    Collectif: 'collective',
    Electricite: 'electric',
    Gaz: 'gaz',
    Fioul: 'fuel',
    Solaire: 'solar',
    Bois: 'wood',
    Charbon: 'coal',
    Propane: 'propane',
    Autre: 'other',
  }
  const result = heatingSystemMap[heatingSystem]

  if (!result) {
    log.warn('unknown heating system : ' + heatingSystem)
  }

  return result
}

export function convertBakingTypes(bakingTypes) {
  const result = Object.keys(bakingTypes).reduce(
    (memo, e) =>
      bakingTypes[e]
        ? [...memo, {type: e.slice(0, -6), number: bakingTypes[e]}]
        : memo,
    [],
  )
  return result
}

export function convertWaterHeatingSystem(waterHeatingSystem) {
  const waterHeatingSystemMap = {
    Collectif: 'collective',
    Electricite: 'electric',
    Gaz: 'gaz',
    Fioul: 'fuel',
    Solaire: 'solar',
    Bois: 'wood',
    Charbon: 'coal',
    Propane: 'propane',
    Autre: 'other',
  }
  const result = waterHeatingSystemMap[waterHeatingSystem]

  if (!result) {
    log.warn('unknown water heating system : ' + waterHeatingSystem)
  }

  return result
}

export function convertConsumption(yearlyData = [], monthlyData = []) {
  const monthsIndexByYear = monthlyData.reduce((memo, d) => {
    const [year, month] = d.month.split('-')
    const intYear = parseInt(year, 10)
    const intMonth = parseInt(month, 10)
    if (!memo[intYear]) {
      memo[intYear] = []
    }
    memo[intYear].push({
      month: intMonth,
      consumptionkWh: d.consumption.energy,
    })
    return memo
  }, {})

  const result = []
  for (const data of yearlyData) {
    const yearResult = {
      year: parseInt(data.year, 10),
      consumptionkWh: data.consumption.energy,
      months: monthsIndexByYear[data.year],
    }
    result.push(yearResult)
  }
  return result
}

export function getEnergyTypeFromContract(contract) {
  return get(contract, 'subscribeOffer.energy') === 'ELECTRICITE'
    ? 'electricity'
    : 'gas'
}
