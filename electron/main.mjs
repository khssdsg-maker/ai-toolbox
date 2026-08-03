import { app, BrowserWindow, session, dialog, shell, ipcMain, WebContentsView } from 'electron'
import path from 'path'
import http from 'http'
import fs from 'fs'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import electronUpdater from 'electron-updater'
const { autoUpdater } = electronUpdater

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV === 'development'
const PORT = 3456

let mainWindow
let server

// ============ 自动更新 ============
function setupAutoUpdate() {
  // 只在打包后的生产环境检查更新
  if (isDev || !app.isPackaged) return

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-available', (info) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '发现新版本',
        message: '发现新版本 v' + info.version + '，正在后台下载...',
        buttons: ['好的'],
      })
    }
  })

  autoUpdater.on('update-downloaded', (info) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '更新已就绪',
        message: 'v' + info.version + ' 已下载完成，重启应用即可安装。',
        buttons: ['立即重启安装', '稍后'],
        defaultId: 0,
        cancelId: 1,
      }).then(({ response }) => {
        if (response === 0) autoUpdater.quitAndInstall()
      })
    }
  })

  autoUpdater.on('error', (err) => {
    // 更新失败静默处理，不影响正常使用
    console.error('自动更新出错:', err && err.message)
  })

  // 启动后延迟检查，避免影响开窗速度
  setTimeout(() => { autoUpdater.checkForUpdates().catch(() => {}) }, 4000)
}

// ============ 链接打开方式设置 ============
function settingsFile() {
  return path.join(app.getPath('userData'), 'link-settings.json')
}
function loadSettings() {
  try { return JSON.parse(fs.readFileSync(settingsFile(), 'utf8')) }
  catch { return { mode: 'ask', browserPath: '' } }
}
function saveSettings(s) {
  try { fs.writeFileSync(settingsFile(), JSON.stringify(s, null, 2)) } catch {}
}

// ============ 收藏文件（主进程直接管理，可靠不丢） ============
function favFile() {
  return path.join(app.getPath('userData'), 'favorites.json')
}
function readFavFile() {
  try { return JSON.parse(fs.readFileSync(favFile(), 'utf8')) } catch { return [] }
}
function writeFavFile(list) {
  try { fs.writeFileSync(favFile(), JSON.stringify(list, null, 2)) } catch {}
}
function normUrl(u) {
  try {
    const x = new URL(u)
    return (x.origin + x.pathname).replace(/\/+$/, '')
  } catch { return u }
}

// 检测已安装的浏览器
function detectBrowsers() {
  const pf = process.env['ProgramFiles'] || 'C:\\Program Files'
  const pf86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)'
  const local = process.env['LOCALAPPDATA'] || ''
  const candidates = [
    { name: 'Chrome', paths: [path.join(pf, 'Google\\Chrome\\Application\\chrome.exe'), path.join(pf86, 'Google\\Chrome\\Application\\chrome.exe'), path.join(local, 'Google\\Chrome\\Application\\chrome.exe')] },
    { name: 'Edge', paths: [path.join(pf86, 'Microsoft\\Edge\\Application\\msedge.exe'), path.join(pf, 'Microsoft\\Edge\\Application\\msedge.exe')] },
    { name: 'Firefox', paths: [path.join(pf, 'Mozilla Firefox\\firefox.exe'), path.join(pf86, 'Mozilla Firefox\\firefox.exe')] },
    { name: '360安全浏览器', paths: [path.join(local, '360se6\\Application\\360se.exe')] },
    { name: '360极速浏览器', paths: [path.join(local, '360Chrome\\Chrome\\Application\\chrome.exe')] },
    { name: 'QQ浏览器', paths: [path.join(pf86, 'Tencent\\QQBrowser\\QQBrowser.exe')] },
  ]
  const found = []
  for (const b of candidates) {
    const p = b.paths.find((x) => x && fs.existsSync(x))
    if (p) found.push({ name: b.name, path: p })
  }
  return found
}

function openExternal(url, settings) {
  if (settings.browserPath && fs.existsSync(settings.browserPath)) {
    spawn(settings.browserPath, [url], { detached: true, stdio: 'ignore' }).unref()
  } else {
    shell.openExternal(url)
  }
}

// ============ 应用内多标签浏览器 ============
const TAB_BAR_HEIGHT = 44
let browserWin = null
let tabs = []
let activeTabId = null
let tabIdSeq = 0

function sendTabs() {
  if (!browserWin || browserWin.isDestroyed()) return
  browserWin.webContents.send('tabs-updated', {
    tabs: tabs.map((t) => ({
      id: t.id,
      title: t.title || '新标签页',
      url: t.view.webContents.getURL(),
      active: t.id === activeTabId,
    })),
  })
}

function layoutTabs() {
  if (!browserWin || browserWin.isDestroyed()) return
  const [w, h] = browserWin.getContentSize()
  for (const t of tabs) {
    t.view.setBounds({ x: 0, y: TAB_BAR_HEIGHT, width: w, height: Math.max(0, h - TAB_BAR_HEIGHT) })
    t.view.setVisible(t.id === activeTabId)
  }
}

function activateTab(id) {
  activeTabId = id
  layoutTabs()
  sendTabs()
}

function addTab(url) {
  if (!browserWin || browserWin.isDestroyed()) return
  const id = ++tabIdSeq
  const view = new WebContentsView({ webPreferences: { contextIsolation: true } })
  browserWin.contentView.addChildView(view)
  const tab = { id, view, title: '' }
  tabs.push(tab)

  view.webContents.on('page-title-updated', (e, title) => { tab.title = title; sendTabs() })
  view.webContents.on('did-navigate', () => sendTabs())
  view.webContents.on('did-navigate-in-page', () => sendTabs())
  // 页面内弹出的新窗口 → 变成新标签页
  view.webContents.setWindowOpenHandler(({ url: u }) => {
    if (u.startsWith('http')) addTab(u)
    return { action: 'deny' }
  })

  view.webContents.loadURL(url)
  activateTab(id)
}

function closeTab(id) {
  const idx = tabs.findIndex((t) => t.id === id)
  if (idx === -1 || !browserWin || browserWin.isDestroyed()) return
  const [tab] = tabs.splice(idx, 1)
  try { browserWin.contentView.removeChildView(tab.view) } catch {}
  try { tab.view.webContents.close() } catch {}

  if (tabs.length === 0) {
    browserWin.close()
    return
  }
  if (activeTabId === id) {
    activateTab(tabs[Math.min(idx, tabs.length - 1)].id)
  } else {
    sendTabs()
  }
}

function openInternalBrowser(url) {
  // 已有浏览器窗口 → 直接新开标签页
  if (browserWin && !browserWin.isDestroyed()) {
    addTab(url)
    browserWin.show()
    browserWin.focus()
    return
  }

  browserWin = new BrowserWindow({
    width: 1280,
    height: 860,
    title: 'AI万能工具箱 - 浏览器',
    autoHideMenuBar: true,
    backgroundColor: '#faf9f7',
    webPreferences: {
      preload: path.join(__dirname, 'tab-preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  browserWin.loadFile(path.join(__dirname, 'tab-bar.html'))
  browserWin.on('resize', () => layoutTabs())
  browserWin.on('closed', () => {
    for (const t of tabs) { try { t.view.webContents.destroy() } catch {} }
    tabs = []
    activeTabId = null
    browserWin = null
  })

  addTab(url)
}

// 标签栏交互
ipcMain.on('tab:activate', (e, id) => activateTab(id))
ipcMain.on('tab:close', (e, id) => closeTab(id))
ipcMain.on('tab:new', () => addTab('about:blank'))

// ============ 标签栏"收藏链接"功能 ============
function parseVideoInMain(url) {
  const bvMatch = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/)
  if (bvMatch) return { platform: '哔哩哔哩', videoConfig: { type: 'bilibili', bvid: bvMatch[1] } }
  const ytMatch =
    url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/) ||
    url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/) ||
    url.match(/youtube\.com\/(?:shorts|embed)\/([a-zA-Z0-9_-]{6,})/)
  if (ytMatch && /youtube\.com|youtu\.be/.test(url)) {
    return { platform: 'YouTube', videoConfig: { type: 'youtube', videoId: ytMatch[1] }, cover: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg` }
  }
  return undefined
}

async function fetchBilibiliInfo(bvid) {
  try {
    const res = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, { signal: AbortSignal.timeout(6000) })
    const data = await res.json()
    if (data && data.code === 0 && data.data) {
      return { title: data.data.title, cover: String(data.data.pic || '').replace(/^http:/, 'https:') }
    }
  } catch {}
  return {}
}

ipcMain.on('tab:favlink', async () => {
  const tab = tabs.find((t) => t.id === activeTabId)
  const url = tab ? tab.view.webContents.getURL() : ''

  if (!tab || !url || url === 'about:blank') {
    dialog.showMessageBox(browserWin, {
      type: 'info',
      title: '收藏链接',
      message: '当前标签页没有内容',
      detail: '请先打开一个视频或网页，再点击"收藏链接"。',
      buttons: ['知道了'],
    })
    return
  }

  const parsed = parseVideoInMain(url)
  let title = tab.title || url
  let cover = parsed ? parsed.cover : undefined

  // B站视频自动获取标题和封面
  if (parsed && parsed.videoConfig && parsed.videoConfig.type === 'bilibili' && parsed.videoConfig.bvid) {
    const info = await fetchBilibiliInfo(parsed.videoConfig.bvid)
    if (info.title) title = info.title
    if (info.cover) cover = info.cover
  }

  // 不是视频链接时询问是否收藏为普通链接
  if (!parsed) {
    const { response } = await dialog.showMessageBox(browserWin, {
      type: 'question',
      title: '收藏链接',
      message: '这个链接不是B站/YouTube视频',
      detail: url,
      buttons: ['仍然收藏这个链接', '取消'],
      cancelId: 1,
    })
    if (response === 1) return
  }

  // 主进程直接保存收藏文件（查重）
  const list = readFavFile()
  const exists = list.some((f) => normUrl(f.href) === normUrl(url))
  if (exists) {
    if (browserWin && !browserWin.isDestroyed()) {
      browserWin.webContents.send('favlink-result', { status: 'duplicate', title })
    }
    return
  }
  list.unshift({
    id: av- + Date.now(),
    title,
    href: url,
    icon: cover,
    platform: parsed ? parsed.platform : undefined,
    videoConfig: parsed ? parsed.videoConfig : undefined,
  })
  writeFavFile(list)
  if (browserWin && !browserWin.isDestroyed()) {
    browserWin.webContents.send('favlink-result', { status: 'added', title })
  }
})

// ============ 设置功能（主页面设置弹窗用） ============
ipcMain.handle('settings:get', () => {
  return { settings: loadSettings(), browsers: detectBrowsers() }
})
ipcMain.on('settings:set', (e, s) => {
  saveSettings(s)
})
ipcMain.on('settings:clear-favorites', () => {
  writeFavFile([])
})

// 处理外部链接点击
async function handleExternalLink(url) {
  const settings = loadSettings()

  if (settings.mode === 'internal') return openInternalBrowser(url)
  if (settings.mode === 'external') return openExternal(url, settings)

  const browsers = detectBrowsers()
  const buttons = ['应用内浏览器（带标签页）', '系统默认浏览器', ...browsers.map((b) => `${b.name} 浏览器`), '取消']
  const { response, checkboxChecked } = await dialog.showMessageBox(mainWindow, {
    type: 'question',
    title: '选择打开方式',
    message: '选择用什么方式打开这个链接？',
    detail: url,
    buttons,
    checkboxLabel: '记住我的选择',
    cancelId: buttons.length - 1,
    defaultId: 0,
  })

  if (response === buttons.length - 1) return

  if (response === 0) {
    settings.mode = 'internal'
  } else if (response === 1) {
    settings.mode = 'external'
    settings.browserPath = ''
  } else {
    settings.mode = 'external'
    settings.browserPath = browsers[response - 2].path
  }

  if (checkboxChecked) saveSettings(settings)

  if (settings.mode === 'internal') openInternalBrowser(url)
  else openExternal(url, settings)
}

// ============ 内置静态服务器 ============
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

function startStaticServer(rootDir) {
  return new Promise((resolve) => {
    server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent(req.url.split('?')[0])

      // 收藏数据接口：读取/删除主进程保存的收藏
      if (urlPath === '/favorites-data') {
        if (req.method === 'DELETE') {
          const qid = new URL(req.url, 'http://localhost').searchParams.get('id')
          writeFavFile(readFavFile().filter((f) => f.id !== qid))
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify({ ok: true }))
          return
        }
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify(readFavFile()))
        return
      }
      let filePath = path.join(rootDir, urlPath)
      if (urlPath.endsWith('/') || !path.extname(urlPath)) {
        filePath = path.join(filePath, 'index.html')
      }
      fs.readFile(filePath, (err, data) => {
        if (err) {
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
    webPreferences: { nodeIntegration: false, contextIsolation: true, preload: path.join(__dirname, 'main-preload.cjs') },
    autoHideMenuBar: true,
    backgroundColor: '#faf9f7',
    show: false,
  })

  mainWindow.once('ready-to-show', () => mainWindow.show())

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      handleExternalLink(url)
    }
    return { action: 'deny' }
  })

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
  // 自动更新放在窗口创建之后，且出错不影响应用正常使用
  try { setupAutoUpdate() } catch (e) { console.error('自动更新初始化失败（不影响使用）:', e && e.message) }
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








