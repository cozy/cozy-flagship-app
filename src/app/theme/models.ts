export enum HomeThemeType {
  Inverted = 'inverted',
  Normal = 'normal'
}

export interface HomeThemeParams {
  homeTheme: HomeThemeType
  componentId: string
}
