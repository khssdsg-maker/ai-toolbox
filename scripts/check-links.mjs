#!/usr/bin/env node
// ============ 死链巡检工具 ============
// 扫描全部收录链接（navigation.json / videos.json / 驱动中心）并实测可访问性
// 用法:
//   node scripts/check-links.mjs                 # 全量巡检
//   node scripts/check-links.mjs --only bilibili # 只查域名含关键字 的链接
//   node scripts/check-links.mjs --timeout 20000 # 自定义超时(毫秒)
// 说明:
//   - 需要科学上网的海外优质站点会显示超时/连接失败，属正常现象，按收录标准应保留
//   - 真正需要淘汰的是确认 404 / DNS 解析失败（域名失效）的链接
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

const args = process.argv.slice(2)
const timeoutIdx = args.indexOf('--timeout')
const TIMEOUT = timeoutIdx > -1 ? Number(args[timeoutIdx + 1]) : 12000
const onlyIdx = args.indexOf('--only')
const ONLY = onlyIdx > -1 ? args[onlyIdx + 1] : ''

// ============ 收集全部收录链接 ============
const entries = []

function pushItem(source, category, item) {
  if (item && item.href && /^https?:\/\//.test(item.href)) {
    entries.push({ source, category, title: item.title || item.href, href: item.href })
  }
}

// 首页 AI 工具目录
try {
  const nav = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/navsphere/content/navigation.json'), 'utf8'))
  for (const cat of nav.navigationItems || []) {
    for (const it of cat.items || []) pushItem('navigation', cat.title, it)
    for (const sub of cat.subCategories || []) {
      for (const it of sub.items || []) pushItem('navigation', `${cat.title} / ${sub.title}`, it)
    }
  }
} catch (e) {
  console.error('读取 navigation.json 失败:', e.message)
}

// 视频合集
try {
  const v = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/navsphere/content/videos.json'), 'utf8'))
  for (const cat of v.navigationItems || []) {
    for (const it of cat.items || []) pushItem('videos', cat.title, it)
  }
} catch (e) {
  console.error('读取 videos.json 失败:', e.message)
}

// 驱动中心（内联在组件里的数据，正则提取）
try {
  const src = fs.readFileSync(path.join(ROOT, 'src/components/drivers-center.tsx'), 'utf8')
  const re = /href:\s*'(https?:\/\/[^']+)'/g
  let m
  while ((m = re.exec(src))) {
    entries.push({ source: 'drivers', category: '驱动中心', title: m[1], href: m[1] })
  }
} catch (e) {
  console.error('读取 drivers-center.tsx 失败:', e.message)
}

// 按域名+路径去重
const seen = new Set()
const links = entries
  .filter((e) => {
    let key
    try {
      const u = new URL(e.href)
      key = u.origin + u.pathname
    } catch {
      key = e.href
    }
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  .filter((e) => !ONLY || e.href.includes(ONLY))

console.log(`🔗 死链巡检：共 ${links.length} 个唯一链接（超时 ${TIMEOUT}ms，来源 navigation/videos/drivers）\n`)

// ============ 并发实测（三级分类：真死链 / 反爬拦截 / 超时） ============
const CONCURRENCY = 8
let done = 0
const dead = []        // 真死链：404/410/5xx/DNS 失效 —— 淘汰或更换
const botBlocked = []  // 反爬拦截：403/429/连接重置等 —— 站点存活，浏览器访问正常，保留
const timeouts = []    // 超时：网络波动或需要科学上网 —— 按收录标准保留
let okCount = 0

function classify(status) {
  if (/^(403|429|405)/.test(status) || /HEADERS_OVERFLOW|ECONNRESET|UND_ERR_SOCKET|ECONNABORTED|ERR_/i.test(status)) return 'bot'
  if (/超时|CONNECT_TIMEOUT|ETIMEDOUT/i.test(status)) return 'timeout'
  return 'dead' // 404 / 410 / 5xx / DNS 解析失败等
}

async function checkOne(entry) {
  try {
    const res = await fetch(entry.href, {
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT),
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml,*/*' },
    })
    if (res.ok) {
      okCount++
    } else {
      const status = `${res.status} ${res.statusText}`.trim()
      const kind = classify(status)
      ;(kind === 'bot' ? botBlocked : dead).push({ ...entry, status })
    }
  } catch (e) {
    const reason = e.name === 'TimeoutError' ? '超时' : String(e.cause?.code || e.message).slice(0, 50)
    const kind = classify(reason)
    ;(kind === 'bot' ? botBlocked : kind === 'timeout' ? timeouts : dead).push({ ...entry, status: reason })
  }
  done++
  process.stdout.write(`\r进度: ${done}/${links.length}`)
}

function printGroup(title, list, note) {
  if (list.length === 0) return
  console.log(`${title}（${list.length} 个）${note ? '  —— ' + note : ''}`)
  for (const f of list) {
    console.log(`  [${f.status}] ${f.title}`)
    console.log(`        ${f.href}`)
    console.log(`        来源: ${f.source} · ${f.category}`)
  }
  console.log('')
}

async function main() {
  const queue = [...links]
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length) {
        const item = queue.shift()
        if (item) await checkOne(item)
      }
    })
  )
  console.log('\n\n============ 巡检结果 ============')
  console.log(`✅ 正常访问: ${okCount} 个`)
  console.log(`🤖 反爬拦截: ${botBlocked.length} 个（站点存活，浏览器正常，保留）`)
  console.log(`⏱️ 超时: ${timeouts.length} 个（网络波动或需科学上网，保留）`)
  console.log(`❌ 真死链: ${dead.length} 个（需淘汰或更换）\n`)

  printGroup('❌ 真死链（必须处理）', dead, '按铁律淘汰或更换链接')
  printGroup('⏱️ 超时（人工抽查即可）', timeouts)
  printGroup('🤖 反爬拦截（无需处理）', botBlocked)

  process.exit(dead.length > 0 ? 1 : 0)
}

main()
