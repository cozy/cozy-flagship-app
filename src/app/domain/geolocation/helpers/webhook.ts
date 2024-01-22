import CozyClient from 'cozy-client'

import { buildServiceWebhookQuery } from '/app/domain/geolocation/helpers/index'
import { storeFetchServiceWebHook } from '/app/domain/geolocation/tracking'
import { FETCH_OPENPATH_TRIPS_SERVICE_NAME } from '/app/domain/geolocation/tracking/consts'

interface WebhookTrigger {
  message: {
    name: string
  }
  links?: {
    webhook?: string
  }
}

export const fetchAndStoreWebhook = async (
  client: CozyClient
): Promise<void> => {
  const webhookQuery = buildServiceWebhookQuery()
  const webhookResp = await client.fetchQueryAndGetFromState(webhookQuery)

  if (Array.isArray(webhookResp.data) && webhookResp.data.length > 0) {
    const data = webhookResp.data as WebhookTrigger[]

    const openpathServiceWebHook = data.find(
      trigger => trigger.message.name === FETCH_OPENPATH_TRIPS_SERVICE_NAME
    )
    const webhook = openpathServiceWebHook?.links?.webhook
    if (webhook) {
      void storeFetchServiceWebHook(webhook)
    }
  }
}
