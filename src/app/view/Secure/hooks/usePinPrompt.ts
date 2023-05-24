import { navigate } from '/libs/RootNavigation'
import { routes } from '/constants/routes'
import { devlog } from '/core/tools/env'

export const usePinPrompt = (
  onSuccess?: () => void
): { handleSetPinCode: () => void; handleIgnorePinCode: () => void } => {
  // Function to handle setting the pin code
  const handleSetPinCode = (): void => {
    navigate(routes.setPin, { onSuccess })
  }

  // Function to handle ignoring the pin code
  const handleIgnorePinCode = (): void => {
    try {
      // Check if onSuccess callback is provided
      if (!onSuccess)
        throw new Error('No onSuccess callback given to PinPrompt')
      onSuccess()
    } catch (error) {
      // Log the error
      devlog(error)
      // Navigate to the home route as a fallback
      navigate(routes.home)
    }
  }

  // Return the functions for external use
  return { handleSetPinCode, handleIgnorePinCode }
}
