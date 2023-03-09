import { useEffect, useState } from 'react'

import { getClouderyUrl } from '/screens/login/cloudery-env/clouderyEnv'

export interface UseClouderyUrlHook {
  uri?: string
}

export const useClouderyUrl = (): UseClouderyUrlHook => {
  const [uri, setUri] = useState<string | undefined>(undefined)

  useEffect(function getClouderyUri() {
    const doAsync = async (): Promise<void> => {
      const clouderyUrl = await getClouderyUrl()

      setUri(clouderyUrl)
    }

    void doAsync()
  }, [])

  return { uri }
}
