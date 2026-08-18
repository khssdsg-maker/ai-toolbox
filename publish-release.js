const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}`)
  return execSync(cmd, { stdio: 'inherit', cwd: process.cwd(), ...opts })
}

function getOutput(cmd) {
  return execSync(cmd, { encoding: 'utf8', cwd: process.cwd() }).trim()
}

async function main() {
  console.log('==========================================')
  console.log(' 🚀 开始全自动打包发布 AI万能工具箱 至 GitHub')
  console.log('==========================================')

  // 配置 Git 用户信息（防止 commit 报错）
  try { run('git config user.name "khssdsg-maker"') } catch {}
  try { run('git config user.email "khssdsg-maker@users.noreply.github.com"') } catch {}

  // 1. 读取并更新 package.json 版本号
  const pkgPath = path.join(process.cwd(), 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  const currentVersion = pkg.version

  let targetVersion = process.argv[2]
  if (targetVersion) {
    targetVersion = targetVersion.replace(/^v/, '')
  } else {
    const parts = currentVersion.split('.')
    if (parts.length === 3) {
      parts[2] = parseInt(parts[2], 10) + 1
      targetVersion = parts.join('.')
    } else {
      targetVersion = currentVersion + '.1'
    }
  }

  console.log(`📌 当前版本: v${currentVersion}  ==>  目标发布版本: v${targetVersion}`)

  pkg.version = targetVersion
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8')
  console.log(`✅ 已修改 package.json 版本号为 v${targetVersion}`)

  // 2. 检查静态环境与旧产物
  console.log('🧹 清理旧构建产物...')
  const dirsToClean = ['.next', 'out', 'dist2']
  dirsToClean.forEach(d => {
    const full = path.join(process.cwd(), d)
    if (fs.existsSync(full)) {
      fs.rmSync(full, { recursive: true, force: true })
    }
  })

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

    const outIndex = path.join(process.cwd(), 'out/index.html')
    if (!fs.existsSync(outIndex)) {
      throw new Error('Static export failed: out/index.html not found')
    }
    console.log('✅ 前端静态页面导出完成！')
  } finally {
    if (movedApi && fs.existsSync(apiDisabled)) fs.renameSync(apiDisabled, apiPath)
    if (movedMiddleware && fs.existsSync(middlewareDisabled)) fs.renameSync(middlewareDisabled, middlewarePath)
    if (movedAdmin && fs.existsSync(adminDisabled)) fs.renameSync(adminDisabled, adminPath)
  }

  // 3. 打包 Electron 客户端包
  console.log('📦 执行 Electron 本地打包 (electron-builder)...')
  run('npx electron-builder --win --publish never --config.directories.output=dist2', {
    env: {
      ...process.env,
      ELECTRON_BUILDER_BINARIES_MIRROR: 'https://npmmirror.com/mirrors/electron-builder-binaries/',
      ELECTRON_MIRROR: 'https://npmmirror.com/mirrors/electron/'
    }
  })

  const dist2 = path.join(process.cwd(), 'dist2')
  const files = fs.readdirSync(dist2)
  const installerFile = files.find(f => f.endsWith('.exe') && !f.includes('blockmap') && !f.includes('uninstaller'))
  const latestYml = files.find(f => f === 'latest.yml')
  const blockmapFile = files.find(f => f.endsWith('.blockmap'))

  if (!installerFile) throw new Error('未找到打包生成的 .exe 安装包！')
  if (!latestYml) throw new Error('未找到更新依赖的 latest.yml 文件！')

  console.log(`✅ 桌面安装包生成成功: ${installerFile}`)

  // 4. Git 提交与 Tag 推送
  console.log(`🏷️ 提交 Git 代码与 Tag v${targetVersion}...`)
  try { run('git add .') } catch {}
  try { run(`git commit -m "release: v${targetVersion}" --allow-empty`) } catch {}
  try { run(`git tag v${targetVersion} -f`) } catch {}
  try { run('git push origin main --tags -f') } catch {}

  // 5. 读取设置组件内的变更日志说明并推送发布到 GitHub Release
  console.log(`☁️ 自动推送发布到 GitHub Release (v${targetVersion})...`)
  let releaseNotesText = ''
  try {
    const settingsCode = fs.readFileSync(path.join(process.cwd(), 'src/components/settings-dialog.tsx'), 'utf8')
    const match = settingsCode.match(new RegExp(`version:\\s*['"]v${targetVersion}['"][\\s\\S]*?changes:\\s*\\[([\\s\\S]*?)\\]`))
    if (match && match[1]) {
      const items = match[1].split('\n').map(l => l.trim().replace(/^['"]|['"],?$/g, '')).filter(Boolean)
      if (items.length > 0) {
        releaseNotesText = '✨ **核心功能与变更：**\n\n' + items.map(i => `- ${i}`).join('\n')
      }
    }
  } catch {}

  const assetsToUpload = [
    path.join(dist2, installerFile),
    path.join(dist2, latestYml)
  ]
  if (blockmapFile) {
    assetsToUpload.push(path.join(dist2, blockmapFile))
  }

  const notesFilePath = path.join(process.cwd(), 'temp_release_notes.md')
  fs.writeFileSync(notesFilePath, releaseNotesText || `AI Toolbox v${targetVersion}`, 'utf8')

  const uploadArgs = assetsToUpload.map(a => `"${a}"`).join(' ')
  try {
    run(`gh release create v${targetVersion} ${uploadArgs} --title "AI Toolbox v${targetVersion}" --notes-file "${notesFilePath}"`)
  } catch (err) {
    console.log('Release 极可能已存在，尝试覆写更新资源文件与 Release 说明...')
    run(`gh release upload v${targetVersion} ${uploadArgs} --clobber`)
    try {
      run(`gh release edit v${targetVersion} --title "AI Toolbox v${targetVersion}" --notes-file "${notesFilePath}"`)
    } catch {}
  } finally {
    if (fs.existsSync(notesFilePath)) {
      fs.unlinkSync(notesFilePath)
    }
  }

  // 6. 自动部署网页版到 Cloudflare Pages（与桌面端一次发布全搞定）
  console.log('🌍 自动部署网页版到 Cloudflare Pages...')
  try {
    run('npx wrangler pages deploy out --project-name ai-toolbox --branch main --commit-dirty=true')
  } catch {
    console.log('⚠️ 网页版部署失败（不影响桌面端发布与 GitHub Release），可手动执行:')
    console.log('   npx wrangler pages deploy out --project-name ai-toolbox --branch main')
  }

  console.log('\n==========================================')
  console.log(` 🎉 成功完成打包与发布 v${targetVersion} 至 GitHub Releases！`)
  console.log(' 客户端开启后将在 4 秒内检测到新版本并自动提示下载安装。')
  console.log(' ==========================================\n')
}

main().catch(err => {
  console.error('\n❌ 发布流程失败:', err)
  process.exit(1)
})
