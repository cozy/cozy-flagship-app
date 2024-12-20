import uniqueId from 'lodash/uniqueId'
import rnperformance, {
  setResourceLoggingEnabled
} from 'react-native-performance'

import type { MeasureOptions } from 'cozy-client/types/performances/types'

export const mark = (markName: string): string => {
  const uniqMarkName = `${uniqueId()} ${markName}`
  rnperformance.mark(uniqMarkName)
  return uniqMarkName
}

export const measure =
  (defaultCategory: string) =>
  ({ measureName, markName, category, color }: MeasureOptions): void => {
    const name = measureName ?? markName

    rnperformance.measure(name, {
      start: markName,
      detail: {
        category: category ?? defaultCategory,
        color: color ?? 'secondary'
      }
    })
  }

export const configurePerformances = (): void => {
  setResourceLoggingEnabled(true)
}

export const getPerformancesLogs = (): string => {
  return JSON.stringify(rnperformance.getEntries())
}

export default {
  mark,
  measure: measure('Flagship')
}

export const CozyClientPerformanceApi = {
  measure: measure('CozyClient'),
  mark
}

export const PouchLinkPerformanceApi = {
  measure: measure('PouchLink'),
  mark
}

export const StackLinkPerformanceApi = {
  measure: measure('StackLink'),
  mark
}
