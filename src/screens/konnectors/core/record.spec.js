import CliskRecorder from './record'

// Mock dependencies
const mockClient = {
  saveAll: jest.fn()
}

const mockLauncher = {
  getStartContext: jest.fn(() => ({ client: mockClient })),
  log: jest.fn(),
  sessionId: 'test-session-id'
}

describe('CliskRecorder', () => {
  let recorder

  beforeEach(() => {
    recorder = new CliskRecorder(mockLauncher)
    jest.clearAllMocks()
  })

  it('should handle clisk event and save when batch size is reached', async () => {
    const event = { type: 'test-event', data: {} }
    for (let i = 0; i < 50; i++) {
      await recorder.handleRecorderEvent(event)
    }
    await recorder.saveCliskEvents.flush() // flush the debounced function
    expect(mockClient.saveAll).toHaveBeenCalledTimes(1)
    expect(recorder.cliskPendingEvents.length).toBe(0)
  })

  it('should not save if no events are pending', async () => {
    await recorder.saveCliskEvents()
    expect(mockClient.saveAll).not.toHaveBeenCalled()
  })

  it('should flush pending events', async () => {
    const event = { type: 'test-event', data: {} }
    await recorder.handleRecorderEvent(event)
    await recorder.flush()
    expect(mockClient.saveAll).toHaveBeenCalledTimes(1)
    expect(recorder.cliskPendingEvents.length).toBe(0)
  })

  it('should log error if saving events fails', async () => {
    mockClient.saveAll.mockImplementationOnce(() => {
      throw new Error('Save failed')
    })
    const event = { type: 'test-event', data: {} }
    await recorder.handleRecorderEvent(event)
    await recorder.flush()
    expect(mockLauncher.log).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'warn',
        msg: expect.stringContaining('Error while saving clisk events')
      })
    )
  })
})
