import RNPerformance from 'react-native-performance'

export const mockRNPerformance: jest.Mocked<typeof RNPerformance> = {
  mark: jest.fn(),
  measure: jest.fn(),
  default: {
    mark: jest.fn(),
    measure: jest.fn(),
  }
} as unknown as jest.Mocked<typeof RNPerformance>
