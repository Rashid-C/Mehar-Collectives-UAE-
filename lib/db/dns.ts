import dns from 'node:dns'

const uri = process.env.MONGODB_URI

if (uri?.startsWith('mongodb+srv://')) {
  const configuredServers =
    process.env.MONGODB_DNS_SERVERS?.split(',')
      .map((server) => server.trim())
      .filter(Boolean) ?? []

  dns.setServers(
    configuredServers.length > 0
      ? configuredServers
      : ['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']
  )
}
