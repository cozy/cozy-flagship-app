export class BackupError extends Error {
  statusCode: number | undefined

  constructor(message: string, statusCode: number | undefined) {
    const stringifiedMessage = JSON.stringify({
      message,
      statusCode
    })

    super(stringifiedMessage)
    this.name = 'BackupError'
    this.statusCode = statusCode
  }
}

export const STACK_ERRORS_INTERRUPTING_BACKUP = [
  413 // quota exceeded
]
