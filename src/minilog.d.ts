interface MiniLogger {
  debug: (...msg: unknown[]) => void
  info: (...msg: unknown[]) => void
  log: (...msg: unknown[]) => void
  warn: (...msg: unknown[]) => void
  error: (...msg: unknown[]) => void
}

declare module '@cozy/minilog' {
  const Minilog: (namespace: string) => MiniLogger

  export default Minilog
}
