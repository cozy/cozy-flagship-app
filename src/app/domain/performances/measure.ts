import rnperformance, {
  setResourceLoggingEnabled
} from 'react-native-performance'

export const mark = (markName: string): void => {
  rnperformance.mark(markName)
}

export const measure = (
  measureName: string,
  markName: string,
  category?: string
): void => {
  rnperformance.measure(measureName, {
    start: markName,
    detail: {
      category: category ?? 'Flagship'
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
  measure
}
