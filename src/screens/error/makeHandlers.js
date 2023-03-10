export const makeHandlers = handlers => event =>
  Object.keys(handlers?.constructor === Object ? handlers : {}).forEach(
    handlerName =>
      event?.nativeEvent?.data?.includes?.(handlerName) &&
      handlers[handlerName]?.()
  )
