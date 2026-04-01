/**
 * Node application entry for hosts that require a startup file (e.g. cPanel).
 * Serves the production build in ./dist using only Node built-ins — no Vite,
 * no esbuild, no WebAssembly — so it works on memory-constrained shared hosts.
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, 'dist')
const port = Number(process.env.PORT || process.env.NODE_PORT || 4173)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.txt':  'text/plain; charset=utf-8',
}

const BASE = '/jagdambaautomobiles'

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0]

  // Strip base path prefix
  if (urlPath.startsWith(BASE)) {
    urlPath = urlPath.slice(BASE.length) || '/'
  }

  // Route admin paths to admin.html
  if (urlPath === '/admin' || urlPath === '/admin.html' || urlPath.startsWith('/admin/')) {
    return serveFile(res, path.join(distDir, 'admin.html'))
  }

  // Try to serve the exact file from dist/
  const filePath = path.join(distDir, urlPath)
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return serveFile(res, filePath)
  }

  // SPA fallback — serve index.html
  serveFile(res, path.join(distDir, 'index.html'))
})

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not found')
      return
    }
    const ext = path.extname(filePath).toLowerCase()
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    res.end(data)
  })
}

server.listen(port, '0.0.0.0', () => {
  console.log(`Serving dist/ on http://0.0.0.0:${port}${BASE}/`)
})
