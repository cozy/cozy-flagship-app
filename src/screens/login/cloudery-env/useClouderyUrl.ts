import { useEffect, useState } from 'react'

import {
  ClouderyUrls,
  getClouderyUrls
} from '/screens/login/cloudery-env/clouderyEnv'

export interface UseClouderyUrlHook {
  urls?: ClouderyUrls
}

export const useClouderyUrl = (): UseClouderyUrlHook => {
  const [urls, setUrls] = useState<ClouderyUrls | undefined>(undefined)

  useEffect(function getClouderyUri() {
    const doAsync = async (): Promise<void> => {
      const clouderyUrl = await getClouderyUrls()

      setUrls(clouderyUrl)
    }

    void doAsync()
  }, [])

  return { urls }
}
