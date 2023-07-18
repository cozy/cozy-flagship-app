export interface ErrorPageGeneratorArguments {
  backgroundColor?: string
}

export type ErrorPageGenerator = ({
  backgroundColor
}: ErrorPageGeneratorArguments) => string
