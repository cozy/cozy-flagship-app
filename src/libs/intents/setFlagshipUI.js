import {changeBarColors} from 'react-native-immersive-bars'
import {EventEmitter} from 'events'

const handleSideEffects = ({bottomTheme, ...parsedIntent}) => {
  const shouldCallBarApi = bottomTheme === 'light' || bottomTheme === 'dark'

  shouldCallBarApi && changeBarColors(bottomTheme === 'light')

  flagshipUI.emit('change', parsedIntent)
}

export const flagshipUI = new EventEmitter()

export const setFlagshipUI = intent =>
  handleSideEffects(
    Object.fromEntries(
      Object.entries({
        ...intent,
        topTheme:
          intent.topTheme === 'light'
            ? 'light-content'
            : intent.topTheme === 'dark'
            ? 'dark-content'
            : undefined,
      })
        .filter(([_k, v]) => v)
        .map(([k, v]) => [k, v.trim()]),
    ),
  )
