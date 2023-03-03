import { minutesToMilliseconds } from '/libs/functions/convertMinutesToMs'

export const constants = {
  timeoutDuration: minutesToMilliseconds(15),
  serviceTimeoutDuration: minutesToMilliseconds(20)
}
