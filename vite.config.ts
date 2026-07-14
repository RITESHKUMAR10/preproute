import dns from 'node:dns'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Local router DNS refuses to resolve the staging backend's domain. `dns.setServers`
// alone doesn't help because `dns.lookup` (used by the proxy's http client) goes
// through the OS resolver, not Node's resolver — so `lookup` itself is patched to
// go via Google DNS for this process only. No system/OS-level DNS change needed.
const googleDns = new dns.Resolver()
googleDns.setServers(['8.8.8.8', '8.8.4.4'])
const originalLookup = dns.lookup
// @ts-expect-error - overriding with a narrower signature than dns.lookup's overloads
dns.lookup = (hostname: string, options: any, callback: any) => {
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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://admin-moderator-backend-staging.up.railway.app',
        changeOrigin: true,
      },
    },
  },
})
