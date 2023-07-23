export interface ErrorPageGeneratorArguments {
  backgroundColor?: string
  error?: {
    message: string
    details: string
  }
}

export type ErrorPageGenerator = ({
  backgroundColor,
  error
}: ErrorPageGeneratorArguments) => string
