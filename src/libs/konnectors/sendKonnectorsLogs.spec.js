import CozyClient from 'cozy-client'

import { sendKonnectorsLogs, sortLogsById } from './sendKonnectorsLogs'

import { store } from '/redux/store'

jest.genMockFromModule('cozy-client')
jest.mock('cozy-client')

const mockFetchJSON = jest.fn()

const mockCozyClient = {
  getStackClient: jest.fn().mockReturnValue({ fetchJSON: mockFetchJSON })
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
CozyClient.mockImplementation(() => mockCozyClient)

jest.mock('/redux/store', () => ({
  store: {
    getState: jest.fn(),
    dispatch: jest.fn()
  }
}))

describe('Konnectors logs', () => {
  it('Should send no log', async () => {
    const client = new CozyClient()

    store.getState.mockReturnValue({
      konnectorLogs: {
        logs: {}
      }
    })

    await sendKonnectorsLogs(client)
    expect(mockFetchJSON).not.toHaveBeenCalled()
    expect(store.dispatch).not.toHaveBeenCalled()
  })

  it('Should send one log', async () => {
    const client = new CozyClient()

    store.getState.mockReturnValue({
      konnectorLogs: {
        logs: {
          myslug: [
            {
              level: 'debug',
              msg: 'Log Message',
              timestamp: '2023-01-05T10:12:32Z'
            }
          ]
        }
      }
    })

    await sendKonnectorsLogs(client)
    expect(mockFetchJSON).toHaveBeenCalledWith(
      'POST',
      '/konnectors/myslug/logs?job_id=',
      [
        {
          level: 'debug',
          msg: 'Log Message',
          timestamp: '2023-01-05T10:12:32Z'
        }
      ]
    )
    expect(store.dispatch).toHaveBeenCalledWith({
      payload: { number: 1, slug: 'myslug' },
      type: 'konnectorLogs/removeLogs'
    })
  })

  it('Should send 2 logs', async () => {
    const client = new CozyClient()

    store.getState.mockReturnValue({
      konnectorLogs: {
        logs: {
          myslug: [
            {
              level: 'error',
              msg: 'Log Message',
              timestamp: '2023-01-05T10:12:32Z'
            },
            {
              level: 'info',
              msg: 'Log Message2',
              timestamp: '2023-01-05T10:12:33Z'
            }
          ]
        }
      }
    })

    await sendKonnectorsLogs(client)
    expect(mockFetchJSON).toHaveBeenCalledWith(
      'POST',
      '/konnectors/myslug/logs?job_id=',
      [
        {
          level: 'error',
          msg: 'Log Message',
          timestamp: '2023-01-05T10:12:32Z'
        },
        {
          level: 'info',
          msg: 'Log Message2',
          timestamp: '2023-01-05T10:12:33Z'
        }
      ]
    )
    expect(store.dispatch).toHaveBeenCalledWith({
      payload: { number: 2, slug: 'myslug' },
      type: 'konnectorLogs/removeLogs'
    })
  })

  it('Should send logs for 2 slugs', async () => {
    const client = new CozyClient()

    store.getState.mockReturnValue({
      konnectorLogs: {
        logs: {
          myslug: [
            {
              level: 'debug',
              msg: 'Log Message',
              timestamp: '2023-01-05T10:12:32Z'
            }
          ],
          myslug2: [
            {
              level: 'debug',
              msg: 'Log Message',
              timestamp: '2023-01-05T10:12:32Z'
            }
          ]
        }
      }
    })

    await sendKonnectorsLogs(client)
    expect(mockFetchJSON).toHaveBeenCalledWith(
      'POST',
      '/konnectors/myslug/logs?job_id=',
      [
        {
          level: 'debug',
          msg: 'Log Message',
          timestamp: '2023-01-05T10:12:32Z'
        }
      ]
    )
    expect(mockFetchJSON).toHaveBeenNthCalledWith(
      2,
      'POST',
      '/konnectors/myslug2/logs?job_id=',
      [
        {
          level: 'debug',
          msg: 'Log Message',
          timestamp: '2023-01-05T10:12:32Z'
        }
      ]
    )

    expect(store.dispatch).toHaveBeenCalledWith({
      payload: { number: 1, slug: 'myslug' },
      type: 'konnectorLogs/removeLogs'
    })
    expect(store.dispatch).toHaveBeenCalledWith({
      payload: { number: 1, slug: 'myslug2' },
      type: 'konnectorLogs/removeLogs'
    })
  })

  it('Should send logs for 2 job ids and without', async () => {
    const client = new CozyClient()

    store.getState.mockReturnValue({
      konnectorLogs: {
        logs: {
          myslug: [
            {
              jobId: 'jobIdA',
              level: 'debug',
              msg: 'Log MessageA',
              timestamp: '2023-01-05T10:12:32Z'
            },
            {
              jobId: 'jobIdB',
              level: 'debug',
              msg: 'Log MessageB',
              timestamp: '2023-01-05T10:12:32Z'
            },
            {
              level: 'debug',
              msg: 'Log Message',
              timestamp: '2023-01-05T10:12:32Z'
            }
          ]
        }
      }
    })

    await sendKonnectorsLogs(client)
    expect(mockFetchJSON).toHaveBeenCalledWith(
      'POST',
      '/konnectors/myslug/logs?job_id=jobIdA',
      [
        {
          jobId: 'jobIdA',
          level: 'debug',
          msg: 'Log MessageA',
          timestamp: '2023-01-05T10:12:32Z'
        }
      ]
    )
    expect(mockFetchJSON).toHaveBeenNthCalledWith(
      2,
      'POST',
      '/konnectors/myslug/logs?job_id=jobIdB',
      [
        {
          jobId: 'jobIdB',
          level: 'debug',
          msg: 'Log MessageB',
          timestamp: '2023-01-05T10:12:32Z'
        }
      ]
    )
    expect(mockFetchJSON).toHaveBeenNthCalledWith(
      3,
      'POST',
      '/konnectors/myslug/logs?job_id=',
      [
        {
          level: 'debug',
          msg: 'Log Message',
          timestamp: '2023-01-05T10:12:32Z'
        }
      ]
    )

    expect(store.dispatch).toHaveBeenCalledWith({
      payload: { number: 3, slug: 'myslug' },
      type: 'konnectorLogs/removeLogs'
    })
  })

  it('Should send logs in group for one job_id', async () => {
    const client = new CozyClient()

    store.getState.mockReturnValue({
      konnectorLogs: {
        logs: {
          myslug: [
            {
              jobId: 'jobIdA',
              level: 'debug',
              msg: 'Log MessageA',
              timestamp: '2023-01-05T10:12:32Z'
            },
            {
              jobId: 'jobIdA',
              level: 'debug',
              msg: 'Log MessageB',
              timestamp: '2023-01-05T10:13:33Z'
            },
            {
              jobId: 'jobIdA',
              level: 'debug',
              msg: 'Log MessageC',
              timestamp: '2023-01-05T10:14:34Z'
            }
          ]
        }
      }
    })

    await sendKonnectorsLogs(client)
    expect(mockFetchJSON).toHaveBeenCalledWith(
      'POST',
      '/konnectors/myslug/logs?job_id=jobIdA',
      [
        {
          jobId: 'jobIdA',
          level: 'debug',
          msg: 'Log MessageA',
          timestamp: '2023-01-05T10:12:32Z'
        },
        {
          jobId: 'jobIdA',
          level: 'debug',
          msg: 'Log MessageB',
          timestamp: '2023-01-05T10:13:33Z'
        },
        {
          jobId: 'jobIdA',
          level: 'debug',
          msg: 'Log MessageC',
          timestamp: '2023-01-05T10:14:34Z'
        }
      ]
    )

    expect(store.dispatch).toHaveBeenCalledWith({
      payload: { number: 3, slug: 'myslug' },
      type: 'konnectorLogs/removeLogs'
    })
  })

  it('Should sort logs message by job id', async () => {
    const cleanedLogs = [
      {
        jobId: 'jobIdA',
        level: 'debug',
        msg: 'Log MessageA',
        timestamp: '2023-01-05T10:12:32Z'
      },
      {
        jobId: 'jobIdB',
        level: 'debug',
        msg: 'Log MessageB',
        timestamp: '2023-01-05T10:12:32Z'
      },
      {
        level: 'debug',
        msg: 'Log Message',
        timestamp: '2023-01-05T10:12:32Z'
      }
    ]

    expect(sortLogsById(cleanedLogs)).toStrictEqual({
      jobIdA: [
        {
          jobId: 'jobIdA',
          level: 'debug',
          msg: 'Log MessageA',
          timestamp: '2023-01-05T10:12:32Z'
        }
      ],
      jobIdB: [
        {
          jobId: 'jobIdB',
          level: 'debug',
          msg: 'Log MessageB',
          timestamp: '2023-01-05T10:12:32Z'
        }
      ],
      undefinedId: [
        {
          level: 'debug',
          msg: 'Log Message',
          timestamp: '2023-01-05T10:12:32Z'
        }
      ]
    })
  })
})
