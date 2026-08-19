import { spawn } from 'child_process'
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const PORT = 3009
const BASE_URL = `http://localhost:${PORT}`

async function main() {
  console.log('Starting next server on port', PORT)
  const server = spawn('npx', ['next', 'dev', '-p', String(PORT)], {
    shell: true,
    stdio: 'pipe',
    env: { ...process.env, PORT: String(PORT) }
  })

  server.stdout.on('data', (d) => process.stdout.write(d))
  server.stderr.on('data', (d) => process.stderr.write(d))

  // Wait for server to become responsive
  let ready = false
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`${BASE_URL}`)
      if (res.ok) {
        ready = true
        console.log('Next.js dev server is ready!')
        break
      }
    } catch (e) {
      await new Promise((r) => setTimeout(r, 1000))
    }
  }

  if (!ready) {
    console.error('Server failed to start in time')
    server.kill()
    process.exit(1)
  }

  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
    colorScheme: 'dark'
  })
  const page = await context.newPage()

  const assetsDir = path.resolve('docs/assets')
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true })
  }

  // 1. Capture Prompts Center
  console.log('Capturing /prompts ...')
  await page.goto(`${BASE_URL}/prompts`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  await page.screenshot({ path: path.join(assetsDir, 'prompts.jpg'), type: 'jpeg', quality: 90 })

  // 2. Capture Arena
  console.log('Capturing /arena ...')
  await page.goto(`${BASE_URL}/arena`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await page.screenshot({ path: path.join(assetsDir, 'arena.jpg'), type: 'jpeg', quality: 90 })

  // 3. Capture Arena with Arbiter Synthesis Hub open
  console.log('Capturing Arbiter mode ...')
  try {
    await page.goto(`${BASE_URL}/arena`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    
    // Fill sample prompt for realistic context
    const textarea = await page.$('textarea')
    if (textarea) {
      await textarea.fill('请深度分析并设计一套高并发、低延迟的分布式订单与库存扣减系统架构，包含缓存与数据库一致性保障方案。')
    }
    
    // Click "对比智能总结" to open the true Dual-Zone Chief Arbiter Modal
    const summarizeBtn = await page.$('button:has-text("智能总结"), button:has-text("对比智能总结")')
    if (summarizeBtn) {
      console.log('Found summarize button, clicking ...')
      await summarizeBtn.click()
      await page.waitForTimeout(1500)
    } else {
      console.log('Summarize button not found')
    }
  } catch (e) {
    console.log('Arbiter toggle error:', e.message)
  }
  await page.screenshot({ path: path.join(assetsDir, 'arbiter.jpg'), type: 'jpeg', quality: 90 })

  // 4. Capture Home AI Catalog
  console.log('Capturing / (Home) ...')
  await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  await page.screenshot({ path: path.join(assetsDir, 'home-ai.jpg'), type: 'jpeg', quality: 90 })

  console.log('All screenshots captured successfully!')
  await browser.close()
  server.kill()
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
