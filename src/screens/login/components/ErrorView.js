import React, { useState } from 'react'
import { Button, View, Text } from 'react-native'

import { navigate } from '/libs/RootNavigation'
import { routes } from '/constants/routes'
import strings from '/constants/strings.json'

import { styles } from './ErrorView.styles'

/**
 * Display an error to the user
 *
 * @param {object} props
 * @param {setInstanceData} props.errorMessage - An error message that should be displayed to the user
 * @param {Error} props.error - The error object
 * @param {ButtonInfo} props.button - The action button to be displayed to the user (ex: to leave the error screen)
 * @returns {import('react').ComponentClass}
 */
export const ErrorView = ({ errorMessage, error, button, backgroundColor }) => {
  const [showDetails, setShowDetails] = useState(false)
  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  if (isErrorAboutNotOnboardedCozy(error)) {
    button.callback()
    navigate(routes.error, {
      type: strings.errorScreens.cozyNotOnboarded,
      backgroundColor
    })
  }

  return (
    <View>
      <Text>AN ERROR OCCURED</Text>
      <Text>{errorMessage}</Text>

      {error && (
        <View style={styles.errorView}>
          <Button onPress={toggleDetails} title="Show details" />
          {showDetails && <Text>{JSON.stringify(error)}</Text>}
        </View>
      )}

      <View style={styles.titleView}>
        <Button onPress={button.callback} title={button.title} />
      </View>
    </View>
  )
}

const isErrorAboutNotOnboardedCozy = error => {
  return (
    error.status === 412 &&
    error.reason?.error === 'the instance has not been onboarded'
  )
}
