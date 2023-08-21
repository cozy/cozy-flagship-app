import React from 'react'
import { Modal, Text, View, StyleSheet } from 'react-native'

import { useError } from '/app/view/Error/ErrorProvider'

export const ErrorToaster = (): JSX.Element => {
  const { error, setError } = useError()

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={!!error}
      onRequestClose={(): void => setError(null)}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>{error.message}</Text>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center'
  }
})
