import { useEffect, useState } from 'react'

import {
  ClouderyType,
  getClouderyTypeFromAsyncStorage
} from '/screens/login/cloudery-env/clouderyType'

export interface UseClouderyTypeHook {
  type?: ClouderyType
}

export const useClouderyType = (): UseClouderyTypeHook => {
  const [type, setType] = useState<ClouderyType | undefined>(undefined)

  useEffect(function getClouderyUri() {
    const doAsync = async (): Promise<void> => {
      const clouderyType = await getClouderyTypeFromAsyncStorage()

      setType(clouderyType)
    }

    void doAsync()
  }, [])

  return { type }
}
