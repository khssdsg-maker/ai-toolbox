const fs = require('fs')
const path = require('path')
const { execSync, spawnSync } = require('child_process')

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}`)
  return execSync(cmd, { stdio: 'inherit', cwd: process.cwd(), ...opts })
}

function main() {
  console.log('==========================================')
  console.log(' 🔄 开始更新本地已安装的 AI万能工具箱...')
  console.log('==========================================')

  // 1. 关闭正在运行的软件实例
  try {
    console.log('正在关闭正在运行的 AI万能工具箱 应用...')
    execSync('taskkill /F /IM "AI万能工具箱.exe"', { stdio: 'ignore' })
  } catch {}

  // 2. 清理旧缓存
  console.log('🧹 清理旧构建缓存...')
  const dirs = ['.next', 'out', 'dist-electron']
  dirs.forEach(d => {
    const full = path.join(process.cwd(), d)
    if (fs.existsSync(full)) {
      try {
        fs.rmSync(full, { recursive: true, force: true })
      } catch (err) {
        console.log(` ⚠️ 跳过清理已锁定的目录: ${d}`)
      }
    }
  })

  // 3. 静态导出构建处理
  const apiPath = path.join(process.cwd(), 'src/app/api')
  const middlewarePath = path.join(process.cwd(), 'src/app/middleware.ts')
  const adminPath = path.join(process.cwd(), 'src/app/admin')

  const apiDisabled = path.join(process.cwd(), 'src/app/_api_disabled')
  const middlewareDisabled = path.join(process.cwd(), 'src/app/middleware-disabled.ts')
  const adminDisabled = path.join(process.cwd(), 'src/app/_admin_disabled')

  let movedApi = false
  let movedMiddleware = false
  let movedAdmin = false

  try {
    if (fs.existsSync(apiPath)) { fs.renameSync(apiPath, apiDisabled); movedApi = true }
    if (fs.existsSync(middlewarePath)) { fs.renameSync(middlewarePath, middlewareDisabled); movedMiddleware = true }
    if (fs.existsSync(adminPath)) { fs.renameSync(adminPath, adminDisabled); movedAdmin = true }

    console.log('🔨 开始导出 Next.js 静态页面...')
    run('npx next build --no-lint', { env: { ...process.env, BUILD_EXPORT: 'true' } })

    if (!fs.existsSync(path.join(process.cwd(), 'out/index.html'))) {
      throw new Error('静态页面导出失败！')
    }
    console.log('✅ 静态页面构建完成！')
  } finally {
    if (movedApi && fs.existsSync(apiDisabled)) fs.renameSync(apiDisabled, apiPath)
    if (movedMiddleware && fs.existsSync(middlewareDisabled)) fs.renameSync(middlewareDisabled, middlewarePath)
    if (movedAdmin && fs.existsSync(adminDisabled)) fs.renameSync(adminDisabled, adminPath)
  }

  // 4. 打包安装包
  console.log('📦 编译桌面客户端安装包...')
  run('npx electron-builder --win --publish never --config.directories.output=dist-electron')

  const distDir = path.join(process.cwd(), 'dist-electron')
  const files = fs.readdirSync(distDir)
  const installerName = files.find(f => f.endsWith('.exe') && !f.includes('blockmap') && !f.includes('uninstaller'))

  if (!installerName) {
    throw new Error('未找到打包生成的安装包文件！')
  }

  const installerPath = path.join(distDir, installerName)
  console.log(`✅ 安装包生成成功: ${installerName}`)

  // 5. 执行静默安装升级
  console.log('⚡ 正在静默安装升级本地应用...')
  spawnSync(installerPath, ['/S'], { stdio: 'inherit' })

  // 6. 启动新版本
  const localAppData = process.env.LOCALAPPDATA || 'C:\\Users\\海辰\\AppData\\Local'
  const appExe = path.join(localAppData, 'Programs\\navsphere\\AI万能工具箱.exe')

  if (fs.existsSync(appExe)) {
    console.log('🚀 正在启动已更新的 AI万能工具箱...')
    try {
      spawnSync(appExe, [], { detached: true, stdio: 'ignore' })
    } catch {}
  }

  console.log('\n==========================================')
  console.log(' 🎉 本地 AI万能工具箱 已成功静默更新并重新启动！')
  console.log('==========================================\n')
}

main()
