export interface BootstrapAction {
  route: string
  params?: Record<string, string | null>
  onboardedRedirection?: string | null
}
