// This script can be called using `yarn perf:convert <path_to_perf_logs>`

import path from 'path'

import fs from 'fs-extra'

interface PerfEntry {
  name: string
  startTime: number
  duration: number
  initiatorType: string
  entryType: string
  detail?: {
    category?: string
  }
}

interface TrackInfo {
  color: string
  track: string
}

const convertFile = (): void => {
  const sourcePath = process.argv[2]

  if (!sourcePath) {
    console.error(
      '⚠️ Missing file path argument. Please provide a path to the source performance logs file'
    )
    return
  }

  const sourceFile = fs.readFileSync(sourcePath, 'utf-8')

  const performanceLogs = JSON.parse(sourceFile) as PerfEntry[]

  const minTimestamp =
    Math.min(...performanceLogs.map(entry => entry.startTime)) * 1000
  const maxTimestamp =
    Math.max(
      ...performanceLogs.map(entry => entry.startTime + entry.duration)
    ) * 1000

  const final = {
    metadata: {
      source: 'Cozy Flagship App',
      startTime: '2024-11-24T11:41:40.862Z',
      dataOrigin: 'TraceEvents'
    },
    traceEvents: [
      {
        args: {
          data: {
            frameTreeNodeId: 1602,
            frames: [
              {
                frame: '58D933E9AC2121C7555CECAF5DABE9EA',
                isInPrimaryMainFrame: true,
                isOutermostMainFrame: true,
                name: '',
                processId: 1119,
                url: 'chrome://newtab/'
              }
            ],
            persistentIds: true
          }
        },
        cat: 'disabled-by-default-devtools.timeline',
        name: 'TracingStartedInBrowser',
        ph: 'I',
        pid: 1083,
        s: 't',
        tid: 259,
        ts: minTimestamp,
        tts: 1604839675
      },
      {
        args: {},
        cat: 'disabled-by-default-devtools.timeline',
        name: 'RunTask',
        ph: 'B',
        pid: 1094,
        tid: 20483,
        ts: maxTimestamp
      },
      ...performanceLogs.map((entry, index) => {
        return {
          args: {
            startTime: entry.startTime,
            detail: JSON.stringify({
              devtools: {
                dataType: 'track-entry',
                ...entryToTrack(entry),
                trackGroup: 'Cozy Flagship App'
              }
            })
          },
          cat: 'blink.user_timing',
          id2: {
            local: '0x' + index.toString(16)
          },
          name: entry.name,
          ph: 'b',
          pid: index,
          tid: 259,
          ts: entry.startTime * 1000
        }
      }),
      ...performanceLogs.map((entry, index) => {
        return {
          args: {},
          cat: 'blink.user_timing',
          id2: {
            local: '0x' + index.toString(16)
          },
          name: entry.name,
          ph: 'e',
          pid: index,
          tid: 259,
          ts: (entry.startTime + entry.duration) * 1000
        }
      }),
      ...marksToEntry('nativeLaunch', performanceLogs),
      ...marksToEntry('reactContextThread', performanceLogs),
      ...marksToEntry('processCoreReactPackage', performanceLogs),
      ...marksToEntry('buildNativeModuleRegistry', performanceLogs),
      ...marksToEntry('loadReactNativeSoFile', performanceLogs),
      ...marksToEntry('createCatalystInstance', performanceLogs),
      ...marksToEntry('createReactContext', performanceLogs),
      ...marksToEntry('preSetupReactContext', performanceLogs),
      ...marksToEntry('setupReactContext', performanceLogs),
      ...marksToEntry('attachMeasuredRootViews', performanceLogs),
      ...marksToEntry('createUiManagerModule', performanceLogs),
      ...marksToEntry('createViewManagers', performanceLogs),
      ...marksToEntry('createUiManagerModuleConstants', performanceLogs),
      ...marksToEntry('runJsBundle', performanceLogs)
    ]
  }

  const sourceFileName = path.basename(sourcePath, '.json')
  const sourceBasePath = path.dirname(sourcePath)
  const destinationPath = path.join(
    sourceBasePath,
    `${sourceFileName}_converted.json`
  )

  fs.writeFileSync(destinationPath, JSON.stringify(final), 'utf-8')
}

const entryToTrack = (entry: PerfEntry): TrackInfo => {
  const category = entry.detail?.category
  if (category) {
    return {
      color: 'primary',
      track: category
    }
  }
  if (entry.initiatorType === 'xmlhttprequest') {
    return {
      color: 'secondary',
      track: 'network'
    }
  }
  if (entry.entryType === 'mark') {
    if (entry.name.includes('SplashScreen')) {
      return {
        color: 'primary-light',
        track: 'splashscreen'
      }
    }

    return {
      color: 'primary-light',
      track: 'mark'
    }
  }
  return {
    color: 'tertiary',
    track: 'global'
  }
}

const marksToEntry = (eventName: string, performanceLogs: PerfEntry[]) => {
  console.log('Do', eventName)
  const startMark = `${eventName}Start`
  const endMark = `${eventName}End`
  const startEvent = performanceLogs.find(e => e.name === startMark)!
  const endEvent = performanceLogs.find(e => e.name === endMark)!

  return [
    {
      args: {
        startTime: startEvent.startTime,
        detail: JSON.stringify({
          devtools: {
            dataType: 'track-entry',
            ...entryToTrack(startEvent),
            trackGroup: 'Cozy Flagship App'
          }
        })
      },
      cat: 'blink.user_timing',
      id2: {
        local: '0x' + (performanceLogs.length + 1).toString(16)
      },
      name: eventName,
      ph: 'b',
      pid: (performanceLogs.length + 1),
      tid: 259,
      ts: startEvent.startTime * 1000
    },
    {
      args: {},
      cat: 'blink.user_timing',
      id2: {
        local: '0x' + (performanceLogs.length + 1).toString(16)
      },
      name: eventName,
      ph: 'e',
      pid: (performanceLogs.length + 1),
      tid: 259,
      ts: (startEvent.startTime + (endEvent.startTime - startEvent.startTime)) * 1000
    }
  ]
}

convertFile()
