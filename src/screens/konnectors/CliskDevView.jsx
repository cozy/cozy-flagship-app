/* eslint-disable no-console */
import React, { useState } from 'react'
import { Button, TextInput, View } from 'react-native'

import { useClient, Q } from 'cozy-client'

const CliskDevView = ({ setLauncherContext }) => {
  const client = useClient()

  const [slug, setSlug] = useState('')
  const [accountId, setAccountId] = useState('')

  const handleRun = async () => {
    const { data: konnector } = await client.query(
      Q('io.cozy.konnectors').getById('io.cozy.konnectors/' + slug)
    )
    const { data: account } = await client.query(
      Q('io.cozy.accounts').getById(accountId)
    )
    const { data: triggers } = await client.query(
      Q('io.cozy.triggers')
        .where({
          'message.account': accountId
        })
        .indexFields(['message.account'])
    )

    if (!konnector) return console.error('no konnector associated to ', slug)
    if (!account) return console.error('no account associated to ', accountId)
    if (!triggers || !triggers[0])
      return console.error('no trigger associated to ', accountId)

    setLauncherContext({
      state: 'launch',
      value: { konnector, account, trigger: triggers[0], DEBUG: true },
    })
  }

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        style={{ fontSize: 30 }}
        placeholder="slug"
        onChangeText={setSlug}
      />
      <TextInput
        placeholder="account id"
        style={{ fontSize: 30 }}
        onChangeText={setAccountId}
      />
      <Button title="run" onPress={handleRun} />
    </View>
  )
}

export default CliskDevView
