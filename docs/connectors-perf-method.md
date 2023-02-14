# API used

- Plain console object
- time(), timeLog(), timeEnd()
- Will try to automate tests; if not, will use manual tests
- Template Konnector

# Steps measured

1. Receive `"startLauncher"` message in `<HomeView />` - `onMessage()` handler
    - Logic will be executed to decide if we should show the launcher
    - Logic will be executed to create dependencies on the spot for the launcher

2. Instanciation of `<LauncherView />` (first constructor line)

3. `<LauncherView />` - `componentDidMount` handler started
    - This will trigger multiple things that we could track
    1. `setStartContext()` ending
    2. `initConnector()` ending
    3. `init()` ending
    4. `start()` ending
      - Now we are in the connector's `start()` method, which itself contains multiple steps.
      For now though, we treat it as a single step because we don't want to go into ReactNativeLauncher implementation details.
  
4. `<LauncherView />` - `render()` method started
  
5. `<LauncherView />` - `willUnmount()` method finished
    - At this point we estimate the job is finished fully

## Steps filtered

After initial review, we decided to filter out some steps that are not relevant to the performance of the connector and only add noise (very little impact on performance). We're only keeping three main steps:
- `initConnector()` ending
- `init()` ending
- `start()` ending

# Results

## When creating an account without cached bundle

- LauncherFlow: 1.19s initConnector() ended

- LauncherFlow: 1.83s init() ended

- LauncherFlow: 65.519s start() ended

## When creating an account with cached bundle

- LauncherFlow: 0.43s initConnector() ended

- LauncherFlow: 1.14s init() ended

- LauncherFlow: 62.35s start() ended

## When refreshing data

- LauncherFlow: 0.25s initConnector() ended

- LauncherFlow: 1.02s init() ended

- LauncherFlow: 40s start() ended

## ReactNativeLauncher.start() method

### When creating an account without cached bundle

- 0.03s `setContentScriptType()` - `"pilot"` ended

- 0.09s `setContentScriptType()` - `"worker"` ended

- 20.37s `ensureAuthenticated()` ended

- 20.65s `sendLoginSuccess()` ended

- 21.59s `getUserDataFromWebsite()` ended

- 22.04s `ensureAccountNameAndFolder()` ended

- 70.35s `fetch()` - `pilotContext` ended

- 70.59s `stop()` ended

### When creating an account with cached bundle

- 0.03s `setContentScriptType()` - `"pilot"` ended

- 0.08s `setContentScriptType()` - `"worker"` ended

- 24.01s `ensureAuthenticated()` ended

- 24.44s `sendLoginSuccess()` ended

- 25.54s `getUserDataFromWebsite()` ended

- 26.01s `ensureAccountNameAndFolder()` ended

- 76.79s `fetch()` - `pilotContext` ended

- 76.89s `stop()` ended

### When refreshing data

- 0.07s `setContentScriptType()` - `"pilot"` ended

- 0.13s `setContentScriptType()` - `"worker"` ended

- 12.12s `ensureAuthenticated()` ended

- 12.39s `sendLoginSuccess()` ended

- 12.55s `getUserDataFromWebsite()` ended

- 12.55s `ensureAccountNameAndFolder()` ended

- 41.80s `fetch()` - `pilotContext` ended

- 42.07s `stop()` ended
