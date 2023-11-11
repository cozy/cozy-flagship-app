type makeHandlersType = (
  handlers?: Record<string, () => void>
) => (event?: { nativeEvent?: { data?: string | unknown } }) => void

export const makeHandlers: makeHandlersType = handlers => event =>
  Object.keys(handlers?.constructor === Object ? handlers : {}).forEach(
    handlerName => {
      const data = event?.nativeEvent?.data
      const isString = typeof data === 'string'

      if (!isString) return

      return data.includes(handlerName) && handlers?.[handlerName]?.()
    }
  )
