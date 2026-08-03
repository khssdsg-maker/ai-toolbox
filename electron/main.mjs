import { app, BrowserWindow } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV === 'development'

let mainWindow
let nextProcess

function startNextServer() {
  return new Promise((resolve, reject) => {
    const port = 3456
    const projectDir = path.join(__dirname, '..')
    
    nextProcess = spawn('npx', ['next', 'start', '-p', String(port)], {
      cwd: projectDir,
      stdio: 'pipe',
      shell: true,
    })

    nextProcess.stdout.on('data', (data) => {
      if (data.toString().includes('Ready') || data.toString().includes('started server')) {
        resolve(port)
      }
    })

    nextProcess.stderr.on('data', (data) => {
      console.error(`Next.js error: ${data}`)
    })

    // 超时处理
    setTimeout(() => resolve(port), 5000)
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
  })

  if (isDev) {
    // 开发模式：连接本地 dev server
    await mainWindow.loadURL('http://localhost:3000')
  } else {
    // 生产模式：启动 Next.js 服务
    const port = await startNextServer()
    await mainWindow.loadURL(`http://localhost:${port}`)
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (nextProcess) nextProcess.kill()
  if (process.platform !== 'darwin') app.quit()
})

app.on('quit', () => {
  if (nextProcess) nextProcess.kill()
})

