export interface LauncherContext {
  job?: { message?: { konnector?: string } }
  state: 'default' | 'launch'
  value?: Record<string, unknown>
}
