import dns from 'node:dns'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'

// Some local networks refuse to resolve the staging backend's domain via the
// OS resolver `dns.lookup` uses. Patch it to go via Google DNS for this
// process only, so the proxy below works regardless of host network config.
const googleDns = new dns.Resolver()
googleDns.setServers(['8.8.8.8', '8.8.4.4'])
const originalLookup = dns.lookup
dns.lookup = (hostname, options, callback) => {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  googleDns.resolve4(hostname, (err, addresses) => {
    if (err || !addresses?.length) {
      originalLookup(hostname, options, callback)
      return
    }
    if (options?.all) {
      callback(
        null,
        addresses.map((address) => ({ address, family: 4 })),
      )
    } else {
      callback(null, addresses[0], 4)
    }
  })
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, 'dist')

const app = express()

// Mounted at root (not via `app.use('/api', ...)`) so Express doesn't strip
// the `/api` prefix from `req.url` before the proxy sees it.
app.use(
  createProxyMiddleware({
    target: 'https://admin-moderator-backend-staging.up.railway.app',
    changeOrigin: true,
    pathFilter: '/api',
  }),
)

app.use(express.static(distDir))

app.use((_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'))
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
