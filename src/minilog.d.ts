declare module '@cozy/minilog' {
  interface MiniLogger {
    debug: (...msg: unknown[]) => void
    info: (...msg: unknown[]) => void
    log: (...msg: unknown[]) => void
    warn: (...msg: unknown[]) => void
    error: (...msg: unknown[]) => void
  }

  const Minilog: (namespace: string) => MiniLogger

  export default Minilog
}
