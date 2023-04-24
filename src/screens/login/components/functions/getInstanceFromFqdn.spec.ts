import { getInstanceFromFqdn } from '/screens/login/components/functions/getInstanceFromFqdn'

describe('getInstanceFromFqdn', () => {
  it('should set secure HTTPS by default', () => {
    const fqdn = 'claude.mycozy.cloud'

    expect(getInstanceFromFqdn(fqdn)).toBe('https://claude.mycozy.cloud')
  })

  it('should set unsecure HTTP for cozy.tools URLs', () => {
    const fqdn = 'claude.cozy.tools:8080'

    expect(getInstanceFromFqdn(fqdn)).toBe('http://claude.cozy.tools:8080')
  })

  it('should set unsecure HTTP for nip.io URLs', () => {
    const fqdn = 'claude.nip.io:8080'

    expect(getInstanceFromFqdn(fqdn)).toBe('http://claude.nip.io:8080')
  })

  it('should set unsecure HTTP for localhost URLs', () => {
    const fqdn = 'claude.localhost:8080'

    expect(getInstanceFromFqdn(fqdn)).toBe('http://claude.localhost:8080')
  })
})
