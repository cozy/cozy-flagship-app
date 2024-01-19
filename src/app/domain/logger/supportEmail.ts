import CozyClient, { Q, fetchPolicies } from 'cozy-client'

import { t } from '/locales/i18n'

export const fetchSupportMail = async (
  client?: CozyClient
): Promise<string> => {
  if (!client) {
    return t('support.email')
  }

  const result = (await client.fetchQueryAndGetFromState({
    definition: Q('io.cozy.settings').getById('io.cozy.settings.context'),
    options: {
      as: 'io.cozy.settings/io.cozy.settings.context',
      fetchPolicy: fetchPolicies.olderThan(60 * 60 * 1000)
    }
  })) as InstanceInfo

  return result.data?.[0]?.attributes?.support_address ?? t('support.email')
}

interface InstanceInfo {
  data?: {
    attributes?: {
      support_address?: string
    }
  }[]
}
