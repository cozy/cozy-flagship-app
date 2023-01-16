import React from 'react'

import { TestPostMe } from './TestPostMe'
import { TestObservable } from './TestObservable'

export const TestPostMeVsObservable = () => {
  return (
    <>
      <TestPostMe iterations={100} />
      <TestObservable iterations={100} />
    </>
  )
}
