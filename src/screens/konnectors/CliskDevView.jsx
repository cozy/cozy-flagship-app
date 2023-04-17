/* eslint-disable no-console */
import React, { useEffect, useState } from 'react'
import { Button, FlatList, Text, TouchableOpacity, View } from 'react-native'

import { useClient, Q } from 'cozy-client'

const CliskDevView = ({ setLauncherContext }) => {
  const client = useClient()

  const [triggers, setTriggers] = useState([])
  const [selected, setSelected] = useState(null)

  const handleRun = async () => {
    const triggerId = selected
    const { data: trigger } = await client.query(
      Q('io.cozy.triggers').getById(triggerId)
    )
    const slug = trigger?.message?.konnector
    const { data: konnector } = await client.query(
      Q('io.cozy.konnectors').getById('io.cozy.konnectors/' + slug)
    )
    const accountId = trigger?.message?.account
    const { data: account } = await client.query(
      Q('io.cozy.accounts').getById(accountId)
    )

    setLauncherContext({
      state: 'launch',
      value: { konnector, account, trigger: triggers[0], DEBUG: true }
    })
  }

  useEffect(() => {
    const doEffect = async () => {
      const { data } = await client.query(
        Q('io.cozy.triggers').where({
          type: '@client'
        })
      )

      return data
    }
    doEffect()
      .then(data => {
        return setTriggers(data)
      })
      .catch(err => {
        console.error('doEffect error : ', err.message)
      })
  }, [client])

  const Item = ({ trigger }) => {
    const fontWeight = trigger._id === selected ? '800' : '400'
    return (
      <TouchableOpacity
        onPress={() => setSelected(trigger._id)}
        style={{ padding: 10 }}
      >
        <Text style={{ fontSize: 20, fontWeight }}>
          {trigger.message.konnector +
            ': ' +
            trigger.message.account.substr(0, 5)}
        </Text>
      </TouchableOpacity>
    )
  }

  // todo lancer l'item sé

  return (
    <View style={{ padding: 20, backGroundColor: '#6e3b6e' }}>
      <FlatList
        data={triggers}
        renderItem={({ item }) => <Item trigger={item} key={item._id} />}
      ></FlatList>
      <Button title="run" onPress={handleRun} />
    </View>
  )
}

export default CliskDevView
