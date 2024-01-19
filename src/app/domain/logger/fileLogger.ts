import { FileLogger, LogLevel } from 'react-native-file-logger'

export const configureFileLogger = async (): Promise<void> => {
  await FileLogger.configure({
    logLevel: LogLevel.Info
  })
}
