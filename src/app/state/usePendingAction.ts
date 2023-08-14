import React from 'react'

import PendingActionContext from './PendingActionContext'

const usePendingAction = () => {
  const context = React.useContext(PendingActionContext)

  if (!context) {
    throw new Error(
      'usePendingAction must be used within a PendingActionProvider'
    )
  }

  const { pendingAction, setPendingAction } = context

  // Define helper functions for better semantics
  const clearPendingAction = () => setPendingAction(null)

  return {
    pendingAction,
    setPendingAction,
    clearPendingAction
  }
}

export default usePendingAction
