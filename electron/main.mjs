import { app, BrowserWindow, session, dialog, shell, ipcMain, WebContentsView, protocol } from 'electron'
import path from 'path'
import http from 'http'
import fs from 'fs'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'

// 隐藏 Electron 自动化标记，伪装标准 Chrome 环境，使 ChatGPT (Arkose/Cloudflare) 和豆包风控 100% 允许正常登录与使用
app.commandLine.appendSwitch('disable-blink-features', 'AutomationControlled')

// 认领字节系自定义协议（必须在 app ready 前注册）：抖音网页版会尝试唤起 bytedance:// 等协议，
// 未认领时 Windows 会弹"获取打开此链接的应用"商店对话框；认领后这些链接在应用内静默终结
protocol.registerSchemesAsPrivileged([
  { scheme: 'bytedance', privileges: { standard: false, supportFetchAPI: false } },
  { scheme: 'snssdk1128', privileges: { standard: false, supportFetchAPI: false } },
  { scheme: 'aweme', privileges: { standard: false, supportFetchAPI: false } },
  { scheme: 'douyin', privileges: { standard: false, supportFetchAPI: false } },
])


const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV === 'development'
const PORT = 3456

let mainWindow
let server

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

ipcMain.handle('app:get-version', () => app.getVersion())

ipcMain.handle('app:check-updates', async () => {
  const currentVersion = app.getVersion()

  // 方式1: 尝试 GitHub Release API
  try {
    const res = await fetch('https://api.github.com/repos/khssdsg-maker/ai-toolbox/releases/latest', {
      headers: { 'User-Agent': 'ai-toolbox-app' },
      signal: AbortSignal.timeout(5000)
    })
    if (res.ok) {
      const data = await res.json()
      const latestVersion = (data.tag_name || '').replace(/^v/, '')
      if (latestVersion && latestVersion !== currentVersion) {
        return { status: 'available', version: latestVersion, releaseUrl: data.html_url }
      }
      return { status: 'latest', version: currentVersion }
    }
  } catch {}

  // 方式2: 备用读取 raw.githubusercontent.com package.json
  try {
    const res = await fetch('https://raw.githubusercontent.com/khssdsg-maker/ai-toolbox/main/package.json', {
      signal: AbortSignal.timeout(5000)
    })
    if (res.ok) {
      const pkg = await res.json()
      const latestVersion = (pkg.version || '').replace(/^v/, '')
      if (latestVersion && latestVersion !== currentVersion) {
        return { status: 'available', version: latestVersion, releaseUrl: 'https://github.com/khssdsg-maker/ai-toolbox/releases/latest' }
      }
      return { status: 'latest', version: currentVersion }
    }
  } catch {}

  return { status: 'error', message: '无法连接 GitHub 服务器，请检查网络或稍后再试' }
})

// 应用内一键异步下载安装包、退出旧应用并自动弹窗调起安装程序
ipcMain.handle('app:start-download-update', async () => {
  try {
    const res = await fetch('https://api.github.com/repos/khssdsg-maker/ai-toolbox/releases/latest', {
      headers: { 'User-Agent': 'ai-toolbox-app' },
      signal: AbortSignal.timeout(6000)
    })
    if (!res.ok) throw new Error('无法连接 GitHub API')
    const data = await res.json()
    const exeAsset = data.assets && data.assets.find(a => a.name && (a.name.endsWith('.exe') || a.name.includes('.exe')))
    if (!exeAsset || !exeAsset.browser_download_url) throw new Error('未发现安装包程序')

    const downloadUrl = exeAsset.browser_download_url
    const destPath = path.join(app.getPath('temp'), 'AI万能工具箱-最新安装包.exe')

    const response = await fetch(downloadUrl)
    if (!response.ok) throw new Error('下载安装包失败')

    const totalBytes = parseInt(response.headers.get('content-length') || '0', 10)
    let downloadedBytes = 0

    const fileStream = fs.createWriteStream(destPath)
    const reader = response.body.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      downloadedBytes += value.length
      fileStream.write(value)
      if (totalBytes > 0 && mainWindow && !mainWindow.isDestroyed()) {
        const percent = Math.round((downloadedBytes / totalBytes) * 100)
        mainWindow.webContents.send('update:download-progress', percent)
      }
    }
    fileStream.end()

    // 自动定位程序当前物理安装目录（如 D:\AI万能工具箱\navsphere）并弹出 NSIS 安装向导
    const currentInstallDir = path.dirname(process.execPath)
    spawn(destPath, [`/D=${currentInstallDir}`], {
      detached: true,
      stdio: 'ignore'
    }).unref()

    setTimeout(() => {
      app.quit()
    }, 500)

    return { status: 'success' }
  } catch (err) {
    return { status: 'error', message: err ? err.message : '下载更新异常' }
  }
})

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
  const activeTab = tabs.find((t) => t.id === activeTabId)
  browserWin.webContents.send('tabs-updated', {
    tabs: tabs.map((t) => ({
      id: t.id,
      title: t.title || '新标签页',
      url: t.view.webContents.getURL(),
      active: t.id === activeTabId,
      autoTranslate: !!t.autoTranslate,
    })),
    activeAutoTranslate: !!activeTab?.autoTranslate,
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

// 注入持续翻译引擎（支持 SPA 动态加载与切页自动持续翻译）
async function injectTranslator(tab) {
  if (!tab || tab.view.webContents.isDestroyed()) return
  const url = tab.view.webContents.getURL()
  if (!url || !url.startsWith('http')) return

  try {
    await tab.view.webContents.executeJavaScript(`
      (function() {
        window.__ai_translate_enabled = true;

        // 1. 创建或更新浮动提示胶囊
        let bar = document.getElementById('__ai_translate_bar');
        if (!bar) {
          bar = document.createElement('div');
          bar.id = '__ai_translate_bar';
          bar.style.cssText = 'position:fixed;top:12px;right:20px;z-index:2147483647;background:rgba(20,27,45,0.95);backdrop-filter:blur(12px);border:1px solid rgba(77,224,177,0.4);border-radius:12px;padding:7px 14px;color:#fff;font-family:system-ui,-apple-system,sans-serif;font-size:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);display:flex;align-items:center;gap:8px;pointer-events:auto;';
          bar.innerHTML = '<span style="color:#4DE0B1;font-weight:600;">🌐 持续自动翻译中</span><span id="__ai_trans_status" style="color:#cbd5e1;">正在翻译...</span><button id="__ai_restore_btn" style="background:#2a364f;border:none;color:#fff;padding:3px 8px;border-radius:6px;cursor:pointer;font-size:11px;">还原原文</button><button id="__ai_close_bar" style="background:transparent;border:none;color:#8a93a6;cursor:pointer;font-size:14px;line-height:1;margin-left:2px;">✕</button>';
          document.body.appendChild(bar);

          document.getElementById('__ai_close_bar').onclick = function() {
            bar.remove();
          };

          document.getElementById('__ai_restore_btn').onclick = function() {
            window.__ai_translate_enabled = false;
            const textWalk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            let n;
            while ((n = textWalk.nextNode())) {
              if (n.__ai_orig) {
                n.nodeValue = n.__ai_orig;
                delete n.__ai_orig;
              }
            }
            bar.remove();
          };
        }

        // 2. 翻译可见文本节点
        async function translateVisibleNodes() {
          if (!window.__ai_translate_enabled) return;
          const statusEl = document.getElementById('__ai_trans_status');
          
          const textNodes = [];
          const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: function(node) {
              const parent = node.parentElement;
              if (!parent) return NodeFilter.FILTER_REJECT;
              if (parent.closest('#__ai_translate_bar')) return NodeFilter.FILTER_REJECT;
              const tag = parent.tagName.toLowerCase();
              if (['script', 'style', 'noscript', 'textarea', 'code', 'pre'].includes(tag)) return NodeFilter.FILTER_REJECT;
              if (node.nodeValue.trim().length > 1 && /[a-zA-Z]{2,}/.test(node.nodeValue) && !node.__ai_orig) {
                return NodeFilter.FILTER_ACCEPT;
              }
              return NodeFilter.FILTER_SKIP;
            }
          });

          let node;
          while ((node = walk.nextNode()) && textNodes.length < 300) {
            textNodes.push(node);
          }

          if (textNodes.length === 0) {
            if (statusEl) statusEl.innerText = '已保持为中文';
            return;
          }

          if (statusEl) statusEl.innerText = '正在翻译 (' + textNodes.length + ' 处新文本)...';

          const batchSize = 15;
          for (let i = 0; i < textNodes.length; i += batchSize) {
            if (!window.__ai_translate_enabled) break;
            const batch = textNodes.slice(i, i + batchSize);
            const promises = batch.map(async (n) => {
              const text = n.nodeValue.trim();
              if (!text || text.length > 800) return;
              try {
                const res = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=zh-CN&dt=t&q=' + encodeURIComponent(text));
                if (res.ok) {
                  const data = await res.json();
                  if (data && data[0]) {
                    const translated = data[0].map(x => x[0]).join('');
                    if (translated && window.__ai_translate_enabled) {
                      n.__ai_orig = n.nodeValue;
                      n.nodeValue = n.nodeValue.replace(text, translated);
                    }
                  }
                }
              } catch (e) {}
            });
            await Promise.all(promises);
          }
          if (statusEl && window.__ai_translate_enabled) statusEl.innerText = '✅ 翻译完成';
        }

        // 3. 启用 MutationObserver 监听动态 DOM 变化（针对 SPA 动态加载、切页、滚动）
        if (!window.__ai_observer) {
          let timer = null;
          window.__ai_observer = new MutationObserver(() => {
            if (!window.__ai_translate_enabled) return;
            clearTimeout(timer);
            timer = setTimeout(() => {
              translateVisibleNodes();
            }, 350);
          });
          window.__ai_observer.observe(document.body, { childList: true, subtree: true });
        }

        translateVisibleNodes();
      })();
    `)
    if (browserWin && !browserWin.isDestroyed()) {
      browserWin.webContents.send('translate-result', { status: 'success' })
    }
  } catch (err) {
    console.error('Translation error:', err)
  }
}

// 还原网页原文
async function revertTranslator(tab) {
  if (!tab || tab.view.webContents.isDestroyed()) return
  try {
    await tab.view.webContents.executeJavaScript(`
      (function() {
        window.__ai_translate_enabled = false;
        const bar = document.getElementById('__ai_translate_bar');
        if (bar) bar.remove();
        const textWalk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = textWalk.nextNode())) {
          if (n.__ai_orig) {
            n.nodeValue = n.__ai_orig;
            delete n.__ai_orig;
          }
        }
      })();
    `)
  } catch {}
}

function addTab(url) {
  if (!browserWin || browserWin.isDestroyed()) return
  const id = ++tabIdSeq
  const view = new WebContentsView({ webPreferences: { contextIsolation: true } })
  browserWin.contentView.addChildView(view)
  const tab = { id, view, title: '', autoTranslate: false }
  tabs.push(tab)

  const handlePageUpdated = () => {
    sendTabs()
    if (tab.autoTranslate) {
      setTimeout(() => injectTranslator(tab), 400)
    }
  }

  view.webContents.on('page-title-updated', (e, title) => { tab.title = title; sendTabs() })
  view.webContents.on('did-finish-load', handlePageUpdated)
  view.webContents.on('did-navigate', handlePageUpdated)
  view.webContents.on('did-navigate-in-page', handlePageUpdated)

  // 页面内弹出的新窗口 → 变成新标签页（继承原标签页的自动翻译设置）
  view.webContents.setWindowOpenHandler(({ url: u }) => {
    if (u.startsWith('http')) {
      addTab(u)
      const newCreated = tabs[tabs.length - 1]
      if (newCreated && tab.autoTranslate) {
        newCreated.autoTranslate = true
      }
    }
    return { action: 'deny' }
  })

  // 通用协议护栏：拦截一切非 web 协议的跳转（bytedance://、weixin://、tmall:// 等），
  // 防止 Windows 弹"获取打开此链接的应用"系统对话框
  const isWebUrl = (u) => /^(https?|about:|file:|data:|blob:)/i.test(u)
  view.webContents.on('will-navigate', (e, u) => {
    if (!isWebUrl(u)) e.preventDefault()
  })
  view.webContents.on('will-redirect', (e, u) => {
    if (!isWebUrl(u)) e.preventDefault()
  })

  // 渲染进程崩溃自愈：黑屏/白屏时自动整页重载，避免出现死黑区域
  view.webContents.on('render-process-gone', () => {
    try { if (!view.webContents.isDestroyed()) view.webContents.reload() } catch {}
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

// 标签栏交互与基础导航
ipcMain.on('tab:activate', (e, id) => activateTab(id))
ipcMain.on('tab:close', (e, id) => closeTab(id))
ipcMain.on('tab:new', () => addTab('about:blank'))

ipcMain.on('tab:back', () => {
  const tab = tabs.find((t) => t.id === activeTabId)
  if (tab && !tab.view.webContents.isDestroyed()) {
    if (tab.view.webContents.navigationHistory && tab.view.webContents.navigationHistory.canGoBack()) {
      tab.view.webContents.navigationHistory.goBack()
    } else if (tab.view.webContents.canGoBack()) {
      tab.view.webContents.goBack()
    }
  }
})

ipcMain.on('tab:forward', () => {
  const tab = tabs.find((t) => t.id === activeTabId)
  if (tab && !tab.view.webContents.isDestroyed()) {
    if (tab.view.webContents.navigationHistory && tab.view.webContents.navigationHistory.canGoForward()) {
      tab.view.webContents.navigationHistory.goForward()
    } else if (tab.view.webContents.canGoForward()) {
      tab.view.webContents.goForward()
    }
  }
})

ipcMain.on('tab:reload', () => {
  const tab = tabs.find((t) => t.id === activeTabId)
  if (tab && !tab.view.webContents.isDestroyed()) {
    tab.view.webContents.reload()
  }
})

ipcMain.on('tab:open-external', () => {
  const tab = tabs.find((t) => t.id === activeTabId)
  const url = tab && !tab.view.webContents.isDestroyed() ? tab.view.webContents.getURL() : ''
  if (url && url.startsWith('http')) {
    shell.openExternal(url)
  }
})

// 内置网页翻译开关（切换当前标签页的自动翻译状态）
ipcMain.on('tab:toggle-translate', (e) => {
  const tab = tabs.find((t) => t.id === activeTabId)
  if (!tab || tab.view.webContents.isDestroyed()) return
  tab.autoTranslate = !tab.autoTranslate
  if (tab.autoTranslate) {
    injectTranslator(tab)
  } else {
    revertTranslator(tab)
  }
  sendTabs()
})

ipcMain.on('tab:translate', (e) => {
  const tab = tabs.find((t) => t.id === activeTabId)
  if (!tab || tab.view.webContents.isDestroyed()) return
  tab.autoTranslate = true
  injectTranslator(tab)
  sendTabs()
})

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
    id: 'fav-' + Date.now(),
    title,
    href: url,
    icon: cover,
    platform: parsed ? parsed.platform : undefined,
    category: parsed ? 'video' : 'website',
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
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        server.listen(0, '127.0.0.1', () => resolve())
      } else {
        resolve()
      }
    })
    server.listen(PORT, '127.0.0.1', () => resolve())
  })
}
ipcMain.on('app:minimize', () => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.minimize()
})
ipcMain.on('app:maximize', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMaximized()) mainWindow.unmaximize()
    else mainWindow.maximize()
  }
})
ipcMain.on('app:close', () => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.close()
})
ipcMain.handle('app:is-maximized', () => {
  return mainWindow && !mainWindow.isDestroyed() ? mainWindow.isMaximized() : false
})

// 真实网页元数据爬虫：提取目标网站真实 Title 与官方 Meta 简介
ipcMain.handle('app:fetch-site-meta', async (e, targetUrl) => {
  if (!targetUrl || typeof targetUrl !== 'string') return { title: '', description: '' }
  try {
    const rawUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`
    const parsed = new URL(rawUrl)
    const res = await fetch(parsed.href, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      },
      signal: AbortSignal.timeout(5000)
    })
    if (!res.ok) return { title: '', description: '' }
    const html = await res.text()

    // 提取 <title>
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    let title = titleMatch ? titleMatch[1].trim() : ''

    // 提取 <meta name="description"> 或 og:description
    const descMatch =
      html.match(/<meta[^>]+name=["'](?:description|Description)["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["'](?:description|Description)["']/i) ||
      html.match(/<meta[^>]+property=["'](?:og:description)["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["'](?:og:description)["']/i)
    let description = descMatch ? descMatch[1].trim() : ''

    // 过滤 title 中的营销垃圾后缀（如 "- 官方网站", "| Official Site", "_首页"）
    if (title) {
      title = title.replace(/(\s*[-_–|·]\s*(官网|官方网站|官方平台|Official Site|Official Website|首页|Home|欢迎访问)).*$/i, '').trim()
    }

    return { title, description }
  } catch (err) {
    return { title: '', description: '' }
  }
})

function getWindowStatePath() {
  return path.join(app.getPath('userData'), 'window-state.json')
}

function loadSavedWindowState() {
  try {
    const p = getWindowStatePath()
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8'))
    }
  } catch {}
  return null
}

function saveWindowState() {
  if (!mainWindow || mainWindow.isDestroyed()) return
  try {
    const isMax = mainWindow.isMaximized()
    const bounds = typeof mainWindow.getNormalBounds === 'function' ? mainWindow.getNormalBounds() : mainWindow.getBounds()
    const data = {
      isMaximized: isMax,
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height
    }
    fs.writeFileSync(getWindowStatePath(), JSON.stringify(data, null, 2))
  } catch {}
}

async function createWindow() {
  const savedState = loadSavedWindowState() || {}

  mainWindow = new BrowserWindow({
    width: savedState.width || 1400,
    height: savedState.height || 900,
    x: savedState.x,
    y: savedState.y,
    minWidth: 800,
    minHeight: 600,
    title: 'AI万能工具箱',
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      preload: path.join(__dirname, 'main-preload.cjs')
    },
    autoHideMenuBar: true,
    backgroundColor: '#09090b',
    icon: path.join(__dirname, '../build/icon.png'),
    show: false,
  })

  mainWindow.once('ready-to-show', () => {
    if (savedState.isMaximized) {
      mainWindow.maximize()
    }
    mainWindow.show()
  })

  mainWindow.on('resize', saveWindowState)
  mainWindow.on('move', saveWindowState)
  mainWindow.on('maximize', saveWindowState)
  mainWindow.on('unmaximize', saveWindowState)
  mainWindow.on('close', saveWindowState)

  // 主窗口防劫持铁闸：拦截并禁止任何外部网页跳转篡改主应用路由
  mainWindow.webContents.on('will-navigate', (e, targetUrl) => {
    const isAppUrl = targetUrl.startsWith('http://localhost') || targetUrl.startsWith('http://127.0.0.1') || targetUrl.startsWith('file://')
    if (!isAppUrl) {
      e.preventDefault()
      handleExternalLink(targetUrl)
    }
  })

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
  // 动态净化 User-Agent：移除 "Electron/x.y.z" 与应用自定义标识，使 OpenAI / Cloudflare / 豆包完全识别为标准 Chrome 浏览器
  const cleanUA = app.userAgentFallback.replace(/Electron\/\S+\s?/g, '').replace(/ai-toolbox\/\S+\s?/g, '').trim()
  app.userAgentFallback = cleanUA
  try { session.defaultSession.setUserAgent(cleanUA) } catch {}

  // 字节系协议静默终结（配合文件顶部的 registerSchemesAsPrivileged）
  for (const s of ['bytedance', 'snssdk1128', 'aweme', 'douyin']) {
    try { protocol.handle(s, () => new Response('', { status: 204 })) } catch {}
  }

  // 系统级封锁本应用的一切 Windows 通知（治本：抖音等网站借应用身份弹的推送通知）
  // 通过注册表把本应用的通知身份设为禁用，无论 Chromium 内部走何种通道都无法弹出
  app.setAppUserModelId('com.ai-toolbox.app')
  const notifKeys = [
    'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings\\com.ai-toolbox.app',
    'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings\\electron.app.Electron',
    'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings\\electron.app.AI万能工具箱',
  ]
  for (const key of notifKeys) {
    try {
      spawn('reg', ['add', key, '/v', 'Enabled', '/t', 'REG_DWORD', '/d', '0', '/f'], { stdio: 'ignore', windowsHide: true })
    } catch {}
  }

  // 允许应用内 iframe / webview 加载文件转换（Convertio）与 AI 分屏对比（各大主流大模型网站）
  // 移除 X-Frame-Options 与 Content-Security-Policy 中的 frame-ancestors 限制
  function setupSessionSecurity(targetSession) {
    try {
      targetSession.setUserAgent(cleanUA)
      targetSession.webRequest.onHeadersReceived((details, callback) => {
        const headers = details.responseHeaders || {}
        for (const key of Object.keys(headers)) {
          const lower = key.toLowerCase()
          if (lower === 'x-frame-options') {
            delete headers[key]
          } else if (lower === 'content-security-policy') {
            headers[key] = (Array.isArray(headers[key]) ? headers[key] : [headers[key]])
              .map((v) => String(v).replace(/frame-ancestors[^;]*;?/gi, '').trim())
              .filter(Boolean)
            if (headers[key].length === 0) delete headers[key]
          }
        }
        callback({ responseHeaders: headers })
      })
    } catch {}
  }

  setupSessionSecurity(session.defaultSession)
  app.on('session-created', (ses) => setupSessionSecurity(ses))

  // 内置浏览器全局禁用网站通知：防止抖音等网站在后台以应用名义弹 Windows 系统通知
  // （仅禁 notifications，摄像头/麦克风/剪贴板等其它权限不受影响）
  session.defaultSession.setPermissionRequestHandler((wc, permission, callback) => {
    callback(permission !== 'notifications')
  })
  session.defaultSession.setPermissionCheckHandler((wc, permission) => {
    return permission !== 'notifications'
  })

  // 自动清理升级留在系统的临时安装包程序，确保零垃圾残余
  try {
    const tempInstaller = path.join(app.getPath('temp'), 'AI万能工具箱-最新安装包.exe')
    if (fs.existsSync(tempInstaller)) fs.unlinkSync(tempInstaller)
    const dlInstaller = path.join(app.getPath('downloads'), 'AI万能工具箱-最新安装包.exe')
    if (fs.existsSync(dlInstaller)) fs.unlinkSync(dlInstaller)
  } catch {}

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








