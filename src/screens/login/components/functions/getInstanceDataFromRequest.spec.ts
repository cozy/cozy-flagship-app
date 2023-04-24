import { WebViewNavigation } from 'react-native-webview'

import { getInstanceDataFromRequest } from '/screens/login/components/functions/getInstanceDataFromRequest'

describe('getInstanceDataFromRequest', () => {
  it('should return an url with the correct scheme if none provided', () => {
    const nav = {
      url: 'https://cozydrive?fqdn=foo.bar.baz'
    } as WebViewNavigation

    expect(getInstanceDataFromRequest(nav)).toStrictEqual({
      fqdn: 'foo.bar.baz',
      instance: 'https://foo.bar.baz'
    })
  })

  it('should return a trimmed url if a whitespace url is provided', () => {
    const nav = {
      url: 'https://cozydrive?fqdn=fo++o.b+++ar.ba+++z+'
    } as WebViewNavigation

    expect(getInstanceDataFromRequest(nav)).toStrictEqual({
      fqdn: 'foo.bar.baz',
      instance: 'https://foo.bar.baz'
    })
  })

  it('should return an url with the correct scheme if provided', () => {
    const nav = {
      url: 'https://cozydrive?fqdn=http://foo.bar.baz'
    } as WebViewNavigation

    expect(getInstanceDataFromRequest(nav)).toStrictEqual({
      fqdn: 'foo.bar.baz',
      instance: 'http://foo.bar.baz'
    })
  })

  it('should return an url with the correct scheme if provided with an https scheme', () => {
    const nav = {
      url: 'https://cozydrive?fqdn=https://foo.bar.baz'
    } as WebViewNavigation

    expect(getInstanceDataFromRequest(nav)).toStrictEqual({
      fqdn: 'foo.bar.baz',
      instance: 'https://foo.bar.baz'
    })
  })

  it('should return an url with the correct scheme if provided with a custom scheme', () => {
    const nav = {
      url: 'https://cozydrive?fqdn=cozy://foo.bar.baz'
    } as WebViewNavigation

    expect(getInstanceDataFromRequest(nav)).toStrictEqual({
      fqdn: 'foo.bar.baz',
      instance: 'cozy://foo.bar.baz'
    })
  })

  it('should return an url with the correct scheme if provided with a port', () => {
    const nav = {
      url: 'https://cozydrive?fqdn=cozy://foo.bar.baz:8080'
    } as WebViewNavigation

    expect(getInstanceDataFromRequest(nav)).toStrictEqual({
      fqdn: 'foo.bar.baz:8080',
      instance: 'cozy://foo.bar.baz:8080'
    })
  })

  it('should return a null value if no fqdn was provided #1', () => {
    const nav = {
      url: 'https://cozydrive'
    } as WebViewNavigation

    expect(getInstanceDataFromRequest(nav)).toBe(null)
  })

  it('should return a null value if no fqdn was provided #2', () => {
    const nav = {
      url: 'https://cozydrive?fqdn'
    } as WebViewNavigation

    expect(getInstanceDataFromRequest(nav)).toBe(null)
  })

  it('should return a null value if no fqdn was provided #3', () => {
    const nav = {
      url: 'https://cozydrive?fqdn='
    } as WebViewNavigation

    expect(getInstanceDataFromRequest(nav)).toBe(null)
  })

  it('should return a null value if the url is falsy', () => {
    const nav = {
      url: ''
    } as WebViewNavigation

    expect(getInstanceDataFromRequest(nav)).toBe(null)
  })

  it('should return a null value if the request is falsy', () => {
    expect(getInstanceDataFromRequest()).toBe(null)
  })

  it('should force unsecure HTTP protocol for cozy.tools URLs', () => {
    const nav = {
      url: 'https://cozydrive?fqdn=claude.cozy.tools:8080'
    } as WebViewNavigation

    expect(getInstanceDataFromRequest(nav)).toStrictEqual({
      fqdn: 'claude.cozy.tools:8080',
      instance: 'http://claude.cozy.tools:8080'
    })
  })

  it('should force unsecure HTTP protocol for localhost URLs', () => {
    const nav = {
      url: 'https://cozydrive?fqdn=claude.cozy.localhost:8080'
    } as WebViewNavigation

    expect(getInstanceDataFromRequest(nav)).toStrictEqual({
      fqdn: 'claude.cozy.localhost:8080',
      instance: 'http://claude.cozy.localhost:8080'
    })
  })

  it('should force unsecure HTTP protocol for nip.io URLs', () => {
    const nav = {
      url: 'https://cozydrive?fqdn=claude.10-0-2-2.nip.io:8080'
    } as WebViewNavigation

    expect(getInstanceDataFromRequest(nav)).toStrictEqual({
      fqdn: 'claude.10-0-2-2.nip.io:8080',
      instance: 'http://claude.10-0-2-2.nip.io:8080'
    })
  })

  it('should lowercase parsed URLs', () => {
    const nav = {
      url: 'https://cozydrive?fqdn=CLAUDE.10-0-2-2.NIP.IO:8080'
    } as WebViewNavigation

    expect(getInstanceDataFromRequest(nav)).toStrictEqual({
      fqdn: 'claude.10-0-2-2.nip.io:8080',
      instance: 'http://claude.10-0-2-2.nip.io:8080'
    })
  })
})
