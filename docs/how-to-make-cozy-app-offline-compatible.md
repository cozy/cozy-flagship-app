# How to make a cozy-app compatible with Offline mode

The Flagship app supports Offline mode by allowing cozy-apps to request a local PouchDB when no connection to the remote cozy-stack is available.

This documentation describes how to make a cozy-app compatible with this Offline mode.

## Libraries minimum version

The Offline mode requires the following libraries' minimal versions:
- cozy-client: X.X.X (see [PR 1507](https://github.com/cozy/cozy-client/pull/1507)) // TODO add final version
- cozy-device-helper: 3.1.0 (see [PR 2562](https://github.com/cozy/cozy-libs/pull/2562))
- cozy-intent: 2.23.0 (see [PR 2562](https://github.com/cozy/cozy-libs/pull/2562))
- cozy-viewer: X.X.X (see [PR 2581](https://github.com/cozy/cozy-libs/pull/2581)) // TODO add final version

## Manifest.webapp

The Flagship app needs to know if a cozy-app supports Offline mode before opening it. This allows to display a dedicated error when trying to open a cozy-app while being offline and when the specified cozy-app does not support this mode.

To make this possible, cozy-apps should declare their compatibility with Offline mode.

This can be done in the cozy-app's `manifest.webapp` file, using the `offline_support` attribute:
```json
{
  "name": "Mes Papiers",
  "slug": "mespapiers",
  //...
  "offline_support": true
}
```

See [cozy-apps-registry](https://docs.cozy.io/en/cozy-apps-registry/#properties-meaning-reference) documentation for more details.

## isFlagshipOfflineSupported

On the other side, cozy-apps may want to verify if the Flagship app supports Offline mode. This check is necessary because we have no control on which version of Flagship app runs on the user's device.

To make this possible, `cozy-device-helper` exposes the `isFlagshipOfflineSupported()` method that returns `true` when the Flagship app supports Offline mode, otherwise it would return `false`.

## FlagshipLink

In order to implement Offline mode, the cozy-app must instantiate `CozyClient` the `FlagshipLink` link.

When doing so, `CozyClient` will redirect every queries to the Flagship app, the the Flagship app will be responsible to return a result from its local PouchDB or from the remote cozy-stack.

Note that `FlagshipLink` should be used only when hosted in the Flagship app, otherwise, `CozyStackLink` should be used as before.

Example of `CozyClient` instantiation with `FlagshipLink`
```js
const shouldUseFlagshipLink = isFlagshipApp() && isFlagshipOfflineSupported()

// New improvements must be done with CozyClient
const cozyClient = new CozyClient({
  uri: `${window.location.protocol}//${data.cozyDomain}`,
  token: data.cozyToken,
  links: shouldUseFlagshipLink
    ? new FlagshipLink({ webviewIntent: intent })
    : null
})
```

## Queries and Fetch

When using the `FlagshipLink` every `.query()` calls are redirected to the Flagship app that will execute the given query in either the local PouchDB or the remote cozy-stack

For now only `.query()` calls are supported, but `fetchJSON()` calls are not. This implies that code that relies on queries will be automatically supported for the Offline mode, but `fetchJSON()` calls will systematically fail when offline. So the cozy-app should ensure that `fetchJSON()` calls are resilient to network errors.

Don't:
```js
const { data } = await client.stackClient.fetchJSON(
  'GET',
  `/registry?versionsChannel=${channel}&filter[type]=konnector&limit=300`
)
```

Do:
```js
try {
  const { data } = await client.stackClient.fetchJSON(
    'GET',
    `/registry?versionsChannel=${channel}&filter[type]=konnector&limit=300`
  )
} catch (error) {
  // handle network error here so the app don't crash
}
```

Or instead modify the corresponding code to use a `.query()` instead.

```js
class RegistryCollection extends DocumentCollection {
  async get(channel) {
    return client.stackClient.fetchJSON(
      'GET',
      `/registry?versionsChannel=${channel}&filter[type]=konnector&limit=300`
    )
  }
}

const document = await client.query(Q('io.cozy.registry').getById(channel))
```

When doing so, the query's result will be considered as a DB document and will be stored in the local PouchDB as a virtual document. Then this document will be accessible offline. However to be accessible the corresponding query has to be called at least one time to be callable again when offline. Also returned data won't be synced until next online call.

## Attributs differences

Having queries executed from either a local PouchDB or the remote cozy-stack implies some differences in the queries results.

All queries executing from a local PouchDB may lack attributes related to JSON-API. This is the case for `.attributes` et `.meta` attributes. So cozy-apps should ensure they do not rely on those attributes.

Don't:
```js
const context = useQuery(contextQuery.definition, contextQuery.options)

const flags = toFlagNames(context.attributes.features)
```

Do:
```js
const context = useQuery(contextQuery.definition, contextQuery.options)

const flags = toFlagNames(context.features)
```

# Implementation examples

Here are some implementation example for inspiration:
- cozy-home:  // TODO add final PR link
- mespapiers: https://github.com/cozy/mespapiers/pull/660