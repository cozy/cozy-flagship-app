export interface BaseProps {
  children: React.ReactNode
  style?: object
}

export interface ListProps extends BaseProps {
  subheader?: JSX.Element
}

export interface ListItemProps extends BaseProps {
  button?: boolean
  onClick?: () => void
}
