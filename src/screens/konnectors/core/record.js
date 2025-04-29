import debounce from 'lodash/debounce'

/**
 * Constants for clisk recording
 */
export const CLISK_EVENTS_SAVE_DELAY = 1000
export const CLISK_BATCH_SIZE = 50

/**
 * Class for recording and managing clisk events during konnector execution.
 * Handles buffering and saving events to avoid overwhelming storage.
 */
class CliskRecorder {
  constructor(launcher) {
    this.launcher = launcher
    this.cliskPendingEvents = []
    this.saveCliskEvents = debounce(
      this.saveCliskEvents,
      CLISK_EVENTS_SAVE_DELAY
    )
  }

  /**
   * Flushes any pending clisk events by forcing an immediate save
   * and waiting for the debounced save to complete
   * @returns {Promise<void>}
   */
  async flush() {
    if (this.cliskPendingEvents.length > 0) {
      await this.saveCliskEvents()
      await this.saveCliskEvents.flush()
    }
  }

  /**
   * Save clisk events incrementally
   * @returns {Promise<void>}
   */
  async saveCliskEvents() {
    try {
      if (this.cliskPendingEvents.length === 0) return

      const { client } = this.launcher.getStartContext()
      if (!client) return

      await client.saveAll(this.cliskPendingEvents)

      this.cliskPendingEvents = []
    } catch (err) {
      const message = err instanceof Error ? err.message : err
      this.launcher.log({
        namespace: 'ReactNativeLauncher',
        label: 'saveCliskEvents',
        level: 'warn',
        msg: 'Error while saving clisk events: ' + message
      })
    }
  }

  /**
   * Handle clisk event received from LauncherView
   * @param {Object} event - The clisk event object
   * @returns {Promise<void>}
   */
  async handleRecorderEvent(event) {
    if (!event) return

    event.timestamp = Date.now()
    event.sessionId = this.launcher.sessionId

    this.cliskPendingEvents.push({ ...event, _type: 'io.cozy.clisk.records' })

    // If we've accumulated enough events, trigger the save
    if (this.cliskPendingEvents.length >= CLISK_BATCH_SIZE) {
      await this.saveCliskEvents()
    }
  }

  /**
   * Attempts to record clisk events from a webview message event
   *
   * @param {Object} launcher - The launcher instance that will handle the clisk event
   * @param {Object} event - The webview message event containing clisk data
   */
  async tryCliskRecord(launcher, event) {
    try {
      if (!event || !launcher)
        return this.launcher.log({
          namespace: 'ReactNativeLauncher',
          label: 'saveCliskEvents',
          level: 'error',
          msg: 'No event or launcher: '
        })

      const { data: rawData } = event.nativeEvent

      const { konnector, job } = launcher.getStartContext()
      const konnectorSlug = konnector?.slug
      const jobId = job?.id

      const dataPayload = { ...JSON.parse(rawData), konnectorSlug, jobId }

      if (!dataPayload.data || dataPayload.messageType !== 'rrweb') return

      delete dataPayload.messageType

      await this.handleRecorderEvent(dataPayload)
    } catch (e) {
      this.launcher.log({
        namespace: 'ReactNativeLauncher',
        label: 'saveCliskEvents',
        level: 'error',
        msg: 'clisk recorder error' + e.message
      })
    }
  }
}

export default CliskRecorder
