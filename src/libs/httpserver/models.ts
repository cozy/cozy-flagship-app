export interface AppData {
  attributes: AppAttributes
  id: string
  links: { self: string }
  meta: Record<string, unknown>
  type: string
}

export interface AppAttributes {
  AppEditor: string
  AppName: string
  AppNamePrefix: string
  AppSlug: string
  Capabilities: string
  Cookie: string
  CozyBar: string
  CozyClientJS: string
  CozyFonts: string
  DefaultWallpaper: string
  Domain: string
  Favicon: string
  Flags: string
  IconPath: string
  Locale: string
  SubDomain: string
  ThemeCSS: string
  Token: string
  Tracking: string
  [key: string]: AppAttributes[keyof AppAttributes]
}

export interface CozyData {
  app: {
    editor?: string
    icon?: string
    name?: string
    prefix?: string
    slug?: string
  }
  capabilities: string
  domain?: string
  flags?: string
  locale?: string
  subdomain?: 'nested' | 'flat'
  token?: string
  tracking?: string
}

export type HtmlSource = 'stack' | 'cache' | 'offline' | 'none'
