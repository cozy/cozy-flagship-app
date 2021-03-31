import React from 'react'
import {Text, Button} from 'react-native'

const Launcher = (props) => {
  const {job} = props.launcherContext
  const {retry} = props
  return (
    <>
      <Text>Run Launcher with connector {job.message.konnector}:</Text>
      <Text> job: {job.id}</Text>
      <Text> trigger {job.trigger_id}</Text>
      <Text> account {job.message.account}</Text>
      <Button title="Retry" onPress={retry} />
    </>
  )
}

export default Launcher
