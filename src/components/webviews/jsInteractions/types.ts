export type OnAnswerCallback = (messageId: string, result: string) => void

export type SubscriberPayload = {
  type: string
  messageId: string
  message?: string
  param: string
}
