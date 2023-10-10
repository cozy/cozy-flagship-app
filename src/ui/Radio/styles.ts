import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  circle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5
  },
  selected: {
    backgroundColor: '#000'
  },
  label: {
    fontSize: 16
  }
})
