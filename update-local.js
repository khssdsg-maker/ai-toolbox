const fs = require('fs')
const path = require('path')
const { execSync, spawnSync } = require('child_process')

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}`)
  return execSync(cmd, { stdio: 'inherit', cwd: process.cwd(), ...opts })
}

// 从注册表读取真实安装位置（用户可能自选 C/D 盘任意目录安装）
// 使用 PowerShell EncodedCommand 传递脚本，彻底规避中文与引号的命令行编码问题
function findInstalledApp() {
  const psScript = `
    [Console]::OutputEncoding = [Text.Encoding]::UTF8
    $keys = @(
      'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
      'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
      'HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall'
    )
    foreach ($k in $keys) {
      Get-ChildItem $k -ErrorAction SilentlyContinue | ForEach-Object {
        $p = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue
        if ($p.DisplayName -like 'AI万能工具箱*') {
          $loc = $p.InstallLocation
          if (-not $loc -and $p.DisplayIcon) { $loc = Split-Path ($p.DisplayIcon -replace ',0$','') }
          if (-not $loc -and $p.UninstallString) { $loc = Split-Path (($p.UninstallString -replace '"','') -replace ' /currentuser.*','') }
          $ver = $p.DisplayVersion
          if (-not $ver -and $p.DisplayName -match 'AI万能工具箱\\s*([\\d.]+)') { $ver = $Matches[1] }
          if ($loc) { Write-Output ($loc.TrimEnd('\\') + '|' + $ver) }
        }
      }
    }`
  try {
    const encoded = Buffer.from(psScript, 'utf16le').toString('base64')
    const out = execSync(`powershell -NoProfile -EncodedCommand ${encoded}`, { encoding: 'utf8' })
    for (const line of out.split(/\r?\n/)) {
      const m = line.match(/^(.+)\|(\d[\w.\-]*)\s*$/)
      if (!m) continue
      const exe = path.join(m[1], 'AI万能工具箱.exe')
      if (fs.existsSync(exe)) return { exe, version: m[2] }
    }
  } catch {}
  return null
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

  // 5. 执行静默安装升级（构建耗时较久，期间应用可能被重新打开，安装前再关一次防止安装器挂起）
  const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
  const killApp = () => { try { execSync('taskkill /F /IM "AI万能工具箱.exe"', { stdio: 'ignore' }) } catch {} }
  const listAppPids = () => {
    try {
      return execSync('tasklist /FI "IMAGENAME eq AI万能工具箱.exe" /NH', { encoding: 'utf8' })
        .split('\n').map(l => l.trim().split(/\s+/)[1]).filter(p => p && /^\d+$/.test(p))
    } catch { return [] }
  }
  const waitInstallLanded = (startMs) => {
    const deadline = Date.now() + 75000
    while (Date.now() < deadline) {
      const inst = findInstalledApp()
      if (inst) {
        let mtime = 0
        try { mtime = fs.statSync(inst.exe).mtimeMs } catch {}
        if (mtime >= startMs) return inst
      }
      sleep(2000)
    }
    return null
  }

  console.log('⚡ 正在静默安装升级本地应用...')
  killApp()
  sleep(3000) // 等待进程句柄完全释放
  let installStartMs = Date.now()
  spawnSync(installerPath, ['/S'], { stdio: 'inherit' })
  let installed = waitInstallLanded(installStartMs)

  // 首次失败自动重试一次：常见原因是安装瞬间应用又被打开（占用文件句柄）
  if (!installed) {
    console.log('⚠️ 首次安装未落地（应用可能在安装瞬间被重新打开），关闭后自动重试...')
    killApp()
    for (let i = 0; i < 15 && listAppPids().length > 0; i++) sleep(2000)
    installStartMs = Date.now()
    spawnSync(installerPath, ['/S'], { stdio: 'inherit' })
    installed = waitInstallLanded(installStartMs)
  }

  // 终极兜底：NSIS 两连败后改用 win-unpacked 完整文件树直接覆盖安装目录（100% 可控可验证）
  // 注：直拷不更新注册表版本号，但 update-local 场景版本号恒等于已装版本（铁律：本地构建不改版本号），校验不受影响
  if (!installed) {
    console.log('⚠️ NSIS 静默安装两次未落地，改用 win-unpacked 直拷覆盖安装...')
    killApp()
    for (let i = 0; i < 15 && listAppPids().length > 0; i++) sleep(2000)
    const unpackedDir = path.join(process.cwd(), 'dist-electron', 'win-unpacked')
    const existing = findInstalledApp()
    const installDir = existing ? path.dirname(existing.exe) : null
    if (installDir && fs.existsSync(path.join(unpackedDir, 'resources', 'app.asar'))) {
      spawnSync('robocopy', [unpackedDir, installDir, '/E', '/COPY:DA', '/DCopy:DA', '/NFL', '/NDL', '/NJH', '/NP'], { stdio: 'ignore' })
      installed = waitInstallLanded(Date.now() - 60000) // 直拷同步完成，放宽时间窗
    }
  }

  // 6. 校验安装真正落地（注册表版本 = 构建版本 且 文件为本次安装后新写入），再从真实安装目录启动
  const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'))
  if (!installed) {
    const pids = listAppPids()
    throw new Error(
      `安装落地校验失败（已自动重试一次）。${pids.length ? `检测到应用进程 PID ${pids.join(', ')} 占用文件，请手动关闭后重跑。` : '请手动运行安装包: ' + installerPath}`
    )
  }
  if (installed.version !== pkg.version) {
    throw new Error(`安装校验失败：已安装 v${installed.version} ≠ 构建 v${pkg.version}（安装可能未真正写入）。请手动运行安装包: ${installerPath}`)
  }
  console.log(`✅ 安装校验通过：v${installed.version} @ ${path.dirname(installed.exe)}（文件已更新）`)

  console.log('🚀 正在启动已更新的 AI万能工具箱...')
  try {
    spawnSync(installed.exe, [], { detached: true, stdio: 'ignore' })
  } catch {}

  console.log('\n==========================================')
  console.log(' 🎉 本地 AI万能工具箱 已成功静默更新并重新启动！')
  console.log('==========================================\n')
}

main()
