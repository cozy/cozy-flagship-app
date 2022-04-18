import React, { useState } from 'react'
import { Button, View, Text } from 'react-native'

/**
 * Display an error to the user
 *
 * @param {object} props
 * @param {setInstanceData} props.errorMessage - An error message that should be displayed to the user
 * @param {Error} props.error - The error object
 * @param {ButtonInfo} props.button - The action button to be displayed to the user (ex: to leave the error screen)
 * @returns {import('react').ComponentClass}
 */
export const ErrorView = ({ errorMessage, error, button }) => {
  const [showDetails, setShowDetails] = useState(false)
  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  return (
    <View>
      <Text>AN ERROR OCCURED</Text>
      <Text>{errorMessage}</Text>

      {error && (
        <View style={{ marginTop: 20 }}>
          <Button onPress={toggleDetails} title="Show details" />
          {showDetails && <Text>{JSON.stringify(error)}</Text>}
        </View>
      )}

      <View style={{ marginTop: 20 }}>
        <Button onPress={button.callback} title={button.title} />
      </View>
    </View>
  )
}
