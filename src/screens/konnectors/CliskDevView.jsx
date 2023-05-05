/* eslint-disable no-console */
import React, { useEffect, useState } from 'react'
import { Button, FlatList, Text, TouchableOpacity, View } from 'react-native'

import { useClient, Q } from 'cozy-client'

const CliskDevView = ({ setLauncherContext }) => {
  const client = useClient()

  const [triggers, setTriggers] = useState([])
  const [konnectors, setKonnectors] = useState([])
  const [selected, setSelected] = useState(null)

  const handleRun = async () => {
    if (selected?._type === 'io.cozy.triggers') {
      const triggerId = selected._id
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
    } else if (selected?._type === 'io.cozy.konnectors') {
      setLauncherContext({
        state: 'launch',
        value: { konnector: selected, DEBUG: true }
      })
    }
  }

  useEffect(() => {
    const doEffect = async () => {
      const { data: clientTriggers } = await client.query(
        Q('io.cozy.triggers').where({
          type: '@client'
        })
      )
      const triggerSlugs = clientTriggers.map(t => t.message.konnector)
      const { data: clientKonnectors } = await client.query(
        Q('io.cozy.konnectors').where({
          clientSide: true
        })
      )
      const filteredKonnectors = clientKonnectors.filter(
        k => !triggerSlugs.includes(k.slug)
      )

      return { clientTriggers, clientKonnectors: filteredKonnectors }
    }
    doEffect()
      .then(({ clientTriggers, clientKonnectors }) => {
        setKonnectors(clientKonnectors)
        return setTriggers(clientTriggers)
      })
      .catch(err => {
        console.error('doEffect error : ', err.message)
      })
  }, [client])

  const TriggerItem = ({ trigger }) => {
    const fontWeight = trigger._id === selected?._id ? '800' : '400'
    return (
      <TouchableOpacity
        onPress={() => setSelected(trigger)}
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

  const KonnectorItem = ({ konnector }) => {
    const fontWeight = konnector._id === selected?._id ? '800' : '400'
    return (
      <TouchableOpacity
        onPress={() => setSelected(konnector)}
        style={{ padding: 10 }}
      >
        <Text style={{ fontSize: 20, fontWeight }}>
          {konnector.slug + ': create'}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={{ padding: 20, backGroundColor: '#6e3b6e' }}>
      <FlatList
        data={triggers}
        renderItem={({ item }) => <TriggerItem trigger={item} key={item._id} />}
      ></FlatList>
      <FlatList
        data={konnectors}
        renderItem={({ item }) => (
          <KonnectorItem konnector={item} key={item._id} />
        )}
      ></FlatList>
      <Button title="run" onPress={handleRun} />
    </View>
  )
}

export default CliskDevView
