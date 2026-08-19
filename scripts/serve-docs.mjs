import http from 'http'
import fs from 'fs'
import path from 'path'

const PORT = 9090
const DOCS_DIR = path.resolve('docs')

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
}

const server = http.createServer((req, res) => {
  let cleanUrl = req.url.split('?')[0].replace(/^\/+/, '')
  if (cleanUrl.startsWith('docs/')) {
    cleanUrl = cleanUrl.replace(/^docs\//, '')
  }
  if (!cleanUrl) cleanUrl = 'index.html'
  const filePath = path.join(DOCS_DIR, cleanUrl)
  console.log(`[REQ] ${req.url} -> ${filePath} (Exists: ${fs.existsSync(filePath)})`)

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase()
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*'
    })
    fs.createReadStream(filePath).pipe(res)
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('404 Not Found')
  }
})

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
