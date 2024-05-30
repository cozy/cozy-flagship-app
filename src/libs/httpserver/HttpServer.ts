import {
  NativeModules,
  AppState,
  Platform,
  NativeEventSubscription
} from 'react-native'

interface NativeHttpServer {
  start: (
    port: string | null,
    root: string | null,
    localOnly: boolean,
    keepAlive: boolean
  ) => Promise<string>

  stop: () => void
  origin: () => Promise<string>
  setSecurityKey: (securityKey: string) => Promise<boolean>
  isRunning: () => Promise<boolean>
}

const NativeHttpServer = NativeModules.HttpServer as NativeHttpServer

const PORT = ''
const ROOT = null

interface ServerOptions {
  localOnly?: boolean
  keepAlive?: boolean
}

class HttpServer {
  private _origin: string | undefined

  started = false
  running = false

  port: string
  root: string | null
  securityKey: string
  keepAlive = false
  localOnly = false

  appStateListener: NativeEventSubscription | null
  _handleAppStateChangeFn: (appState: string) => void

  constructor(port: number, root?: string, opts?: ServerOptions) {
    this.port = `${port}` || PORT
    this.root = root ?? ROOT
    this.localOnly = opts?.localOnly ?? false
    this.keepAlive = opts?.keepAlive ?? false

    this.started = false
    this._origin = undefined
    this.securityKey = ''

    this.appStateListener = null
    this._handleAppStateChangeFn = this._handleAppStateChange.bind(this)
  }

  start(): Promise<string> {
    if (this.running) {
      if (!this.origin) {
        throw new Error(
          'Origin is null when server is running, should not happen'
        )
      }

      return Promise.resolve(this.origin)
    }

    this.started = true
    this.running = true

    if (!this.keepAlive && Platform.OS === 'android') {
      this.appStateListener = AppState.addEventListener(
        'change',
        this._handleAppStateChangeFn
      )
    }

    return NativeHttpServer.start(
      this.port,
      this.root,
      this.localOnly,
      this.keepAlive
    )
      .then(async origin => {
        await NativeHttpServer.setSecurityKey(this.securityKey)
        return origin
      })
      .then(origin => {
        this._origin = origin
        return origin
      })
  }

  stop(): void {
    this.running = false

    return NativeHttpServer.stop()
  }

  kill(): void {
    this.stop()
    this.started = false
    this._origin = undefined
    this.appStateListener?.remove()
  }

  _handleAppStateChange(appState: string): void {
    if (!this.started) {
      return
    }

    if (appState === 'active' && !this.running) {
      void this.start()
    }

    if (appState === 'background' && this.running) {
      this.stop()
    }

    if (appState === 'inactive' && this.running) {
      this.stop()
    }
  }

  get origin(): string | undefined {
    return this._origin
  }

  isRunning(): Promise<boolean> {
    return NativeHttpServer.isRunning().then(running => {
      this.running = running

      return this.running
    })
  }

  setSecurityKey(key: string): Promise<boolean> {
    this.securityKey = key
    return NativeHttpServer.setSecurityKey(key)
  }
}

export default HttpServer
