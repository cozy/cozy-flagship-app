export type OnAnswerCallback = (messageId: string, result: string) => void

export interface SubscriberPayload {
  type: string
  messageId: string
  message?: string
  param: string
}
