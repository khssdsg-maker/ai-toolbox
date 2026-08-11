const fs = require('fs')
const path = require('path')
const dns = require('dns').promises

const navPath = path.join(__dirname, '../src/navsphere/content/navigation.json')
const navData = JSON.parse(fs.readFileSync(navPath, 'utf8'))

const allLinks = []
navData.navigationItems.forEach(cat => {
  cat.items.forEach(item => {
    allLinks.push({ catId: cat.id, catTitle: cat.title, itemId: item.id, itemTitle: item.title, href: item.href })
  })
})

console.log(`Checking ${allLinks.length} navigation links for DNS and HTTP errors...`)

async function checkLink(item) {
  try {
    const url = new URL(item.href)
    const hostname = url.hostname

    // Step 1: Check DNS resolution
    try {
      await dns.lookup(hostname)
    } catch (dnsErr) {
      if (dnsErr.code === 'ENOTFOUND' || dnsErr.code === 'NXDOMAIN') {
        return { ok: false, reason: `域名已不存在/过期 (DNS ${dnsErr.code})` }
      }
    }

    // Step 2: Try HTTP fetch
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    try {
      const res = await fetch(item.href, {
        method: 'HEAD',
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      })
      clearTimeout(timeoutId)
      if (res.status === 404 || res.status === 410 || res.status === 502 || res.status === 503) {
        return { ok: false, reason: `HTTP 错误 ${res.status}` }
      }
      return { ok: true }
    } catch (fetchErr) {
      clearTimeout(timeoutId)
      // Try GET fallback
      const controller2 = new AbortController()
      const timeoutId2 = setTimeout(() => controller2.abort(), 5000)
      try {
        const res2 = await fetch(item.href, {
          method: 'GET',
          signal: controller2.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        })
        clearTimeout(timeoutId2)
        if (res2.status === 404 || res2.status === 410 || res2.status === 502 || res2.status === 503) {
          return { ok: false, reason: `HTTP 错误 ${res2.status}` }
        }
        return { ok: true }
      } catch (err2) {
        clearTimeout(timeoutId2)
        // If connection reset or timeout on overseas site (e.g. google, openai), it's GFW block, not a dead site.
        // But if ECONNREFUSED or DNS error, it's dead.
        if (err2.cause && (err2.cause.code === 'ECONNREFUSED' || err2.cause.code === 'ENOTFOUND')) {
          return { ok: false, reason: `拒绝连接/网络关闭 (${err2.cause.code})` }
        }
        return { ok: true, note: '需要科学上网访问' }
      }
    }
  } catch (err) {
    return { ok: false, reason: `无效的 URL 格式: ${err.message}` }
  }
}

async function main() {
  const deadItems = []
  for (const item of allLinks) {
    const result = await checkLink(item)
    if (!result.ok) {
      console.log(`❌ 发现死链/失效网站: [${item.catTitle}] ${item.itemTitle} (${item.href}) — 原因: ${result.reason}`)
      deadItems.push({ ...item, reason: result.reason })
    } else {
      console.log(`✅ 正常: [${item.catTitle}] ${item.itemTitle} ${result.note ? `(${result.note})` : ''}`)
    }
  }

  console.log(`\n==========================================`)
  console.log(`检测完成：共检测 ${allLinks.length} 个工具链接。`)
  console.log(`发现死链/失效网站: ${deadItems.length} 个`)
  console.log(`==========================================\n`)

  if (deadItems.length > 0) {
    fs.writeFileSync(path.join(__dirname, 'dead_links.json'), JSON.stringify(deadItems, null, 2), 'utf8')
    
    // Auto remove dead items from navigation.json
    const deadIds = new Set(deadItems.map(d => d.itemId))
    navData.navigationItems.forEach(cat => {
      cat.items = cat.items.filter(item => !deadIds.has(item.id))
    })
    fs.writeFileSync(navPath, JSON.stringify(navData, null, 2), 'utf8')
    console.log(`🧹 已自动将 ${deadItems.length} 个失效网站从 navigation.json 中彻底移除淘汰！`)
  }
}

main()
