import { app, BrowserWindow, session } from 'electron'
import path from 'path'
import http from 'http'
import fs from 'fs'

const isDev = process.env.NODE_ENV === 'development'
const PORT = 3456

let mainWindow
let server

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
  '.map': 'application/json',
}

// 内置静态服务器：直接提供打包好的前端文件，不依赖任何外部环境
function startStaticServer(rootDir) {
  return new Promise((resolve) => {
    server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent(req.url.split('?')[0])
      let filePath = path.join(rootDir, urlPath)

      // 目录则找 index.html
      if (urlPath.endsWith('/') || !path.extname(urlPath)) {
        filePath = path.join(filePath, 'index.html')
      }

      fs.readFile(filePath, (err, data) => {
        if (err) {
          // 找不到的路径返回首页（支持前端路由）
          fs.readFile(path.join(rootDir, 'index.html'), (err2, data2) => {
            if (err2) { res.writeHead(404); res.end('Not Found') }
            else { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(data2) }
          })
          return
        }
        const ext = path.extname(filePath).toLowerCase()
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
        res.end(data)
      })
    })
    server.listen(PORT, '127.0.0.1', () => resolve())
  })
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'AI万能工具箱',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    backgroundColor: '#faf9f7',
    show: false,
  })

  mainWindow.once('ready-to-show', () => mainWindow.show())

  const url = isDev ? 'http://localhost:3000' : `http://127.0.0.1:${PORT}`

  if (!isDev) {
    await startStaticServer(path.join(process.resourcesPath, 'web'))
  }

  await mainWindow.loadURL(url)
  mainWindow.webContents.on('did-fail-load', () => {
    setTimeout(() => mainWindow && mainWindow.loadURL(url), 2000)
  })

  mainWindow.on('closed', () => { mainWindow = null })
}

app.whenReady().then(async () => {
  await session.defaultSession.clearCache()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (server) server.close()
  app.quit()
})

app.on('quit', () => {
  if (server) server.close()
})
