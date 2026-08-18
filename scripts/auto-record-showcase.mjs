import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const videosDir = path.join(projectRoot, 'videos');

if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

// 本地超高速服务
const TARGET_URL = 'http://localhost:3000';

console.log(`=======================================================`);
console.log(`🎬 [AI万能工具箱] 全自动演示与 1080P 视频录制流水线启动`);
console.log(`📍 目标地址: ${TARGET_URL}`);
console.log(`📁 视频输出目录: ${videosDir}`);
console.log(`=======================================================\n`);

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

async function injectVirtualCursor(page) {
  try {
    await page.addStyleTag({
      content: `
        #virtual-cursor {
          position: fixed;
          width: 24px;
          height: 24px;
          pointer-events: none;
          z-index: 999999;
          transform: translate(-2px, -2px);
          transition: transform 0.05s linear;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
        }
        .click-ripple {
          position: fixed;
          width: 44px;
          height: 44px;
          border: 2px solid #00f2fe;
          border-radius: 50%;
          pointer-events: none;
          z-index: 999998;
          transform: translate(-50%, -50%) scale(0.2);
          opacity: 1;
          animation: rippleEffect 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes rippleEffect {
          0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; border-color: #00f2fe; }
          100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; border-color: #4facfe; }
        }
        #demo-hud-badge {
          position: fixed;
          bottom: 36px;
          right: 48px;
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 242, 254, 0.4);
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), 0 0 24px rgba(0, 242, 254, 0.25);
          color: #f8fafc;
          padding: 14px 28px;
          border-radius: 40px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 17px;
          font-weight: 700;
          z-index: 999990;
          display: flex;
          align-items: center;
          gap: 14px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        #demo-hud-badge.show {
          opacity: 1;
          transform: translateY(0);
        }
        #demo-hud-badge .hud-dot {
          width: 12px;
          height: 12px;
          background: #00f2fe;
          border-radius: 50%;
          box-shadow: 0 0 12px #00f2fe;
          animation: hudPulse 1.5s infinite;
        }
        @keyframes hudPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.75); }
        }
      `
    });

    await page.evaluate(() => {
      if (!document.getElementById('virtual-cursor')) {
        const cursor = document.createElement('div');
        cursor.id = 'virtual-cursor';
        cursor.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.5 3.2L18.5 13.8L12.2 14.5L15.8 20.8L13.2 22.2L9.6 16.0L5.5 19.5V3.2Z" fill="#00f2fe" stroke="#0f172a" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
        `;
        document.body.appendChild(cursor);
      }
      if (!document.getElementById('demo-hud-badge')) {
        const hud = document.createElement('div');
        hud.id = 'demo-hud-badge';
        hud.innerHTML = `<span class="hud-dot"></span><span id="hud-text">AI万能工具箱 演示开始</span>`;
        document.body.appendChild(hud);
      }
    });
  } catch (e) {}
}

async function updateHUD(page, text) {
  try {
    await page.evaluate((t) => {
      const hud = document.getElementById('demo-hud-badge');
      const hudText = document.getElementById('hud-text');
      if (hud && hudText) {
        hudText.textContent = t;
        hud.classList.add('show');
      }
    }, text);
  } catch (e) {}
}

let currentMouseX = 960;
let currentMouseY = 540;

async function smoothMouseMove(page, targetX, targetY, durationMs = 500) {
  try {
    const steps = Math.max(12, Math.floor(durationMs / 25));
    const startX = currentMouseX;
    const startY = currentMouseY;

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const ease = easeInOutCubic(t);
      const x = startX + (targetX - startX) * ease;
      const y = startY + (targetY - startY) * ease;

      await page.mouse.move(x, y);
      await page.evaluate(({ cx, cy }) => {
        const cur = document.getElementById('virtual-cursor');
        if (cur) {
          cur.style.left = `${cx}px`;
          cur.style.top = `${cy}px`;
        }
      }, { cx: x, cy: y }).catch(() => {});

      await page.waitForTimeout(durationMs / steps);
    }

    currentMouseX = targetX;
    currentMouseY = targetY;
  } catch (e) {}
}

async function smoothClick(page, selectorOrBox, clickDelayMs = 250) {
  try {
    let targetX, targetY;
    if (typeof selectorOrBox === 'string') {
      const el = await page.waitForSelector(selectorOrBox, { state: 'visible', timeout: 5000 });
      const box = await el.boundingBox();
      if (!box) return;
      targetX = box.x + box.width / 2;
      targetY = box.y + box.height / 2;
    } else {
      targetX = selectorOrBox.x + selectorOrBox.width / 2;
      targetY = selectorOrBox.y + selectorOrBox.height / 2;
    }

    await smoothMouseMove(page, targetX, targetY, 450);

    await page.evaluate(({ cx, cy }) => {
      const ripple = document.createElement('div');
      ripple.className = 'click-ripple';
      ripple.style.left = `${cx}px`;
      ripple.style.top = `${cy}px`;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }, { cx: targetX, cy: targetY }).catch(() => {});

    await page.mouse.click(targetX, targetY);
    await page.waitForTimeout(clickDelayMs);
  } catch (e) {}
}

async function humanType(page, selector, text, keyDelayMs = 60) {
  try {
    const el = await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
    const box = await el.boundingBox();
    if (box) {
      await smoothClick(page, box);
    }
    for (const char of text) {
      await page.keyboard.type(char);
      const variance = (Math.random() - 0.5) * 20;
      await page.waitForTimeout(Math.max(25, keyDelayMs + variance));
    }
    await page.waitForTimeout(200);
  } catch (e) {}
}

async function runAutoRecord() {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--window-size=1920,1080',
      '--no-sandbox'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: videosDir,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  console.log(`⏳ 1. 正在载入主页...`);
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await injectVirtualCursor(page);

  // 场景 1: 首页检索与分类直达
  console.log(`🎬 场景 1: 首页快速筛选与悬停展示...`);
  await updateHUD(page, '⚡ 场景 1: 首页海量工具 · 极速秒级筛选');
  await page.waitForTimeout(1500);

  const searchInput = 'input[placeholder*="搜索"], input[type="search"], input[type="text"]';
  try {
    await humanType(page, searchInput, 'DeepSeek', 70);
    await page.waitForTimeout(1200);

    const firstCard = 'a[href*="deepseek"], div:has-text("DeepSeek")';
    const cardEl = await page.$(firstCard);
    if (cardEl) {
      const box = await cardEl.boundingBox();
      if (box) {
        await smoothMouseMove(page, box.x + box.width / 2, box.y + box.height / 2, 450);
        await page.waitForTimeout(1200);
      }
    }

    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(800);
  } catch (e) {}

  // 场景 2: 切换到【提示词灵感宝典】(/prompts)
  console.log(`🎬 场景 2: 切换到 AI 提示词灵感宝典...`);
  await page.goto(`${TARGET_URL}/prompts`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await injectVirtualCursor(page);
  await updateHUD(page, '💡 场景 2: 提示词宝典 · 动态填空与一键直通');
  await page.waitForTimeout(1500);

  await smoothMouseMove(page, 960, 480, 500);
  await page.mouse.wheel(0, 260);
  await page.waitForTimeout(1200);
  await page.mouse.wheel(0, -260);
  await page.waitForTimeout(1000);

  // 场景 3: 切换到【AI 大模型分屏对比台】(/arena)
  console.log(`🎬 场景 3: 切换到 AI 大模型分屏对比台 (/arena)...`);
  await page.goto(`${TARGET_URL}/arena`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await injectVirtualCursor(page);
  await updateHUD(page, '⚔️ 场景 3: 10+ 顶流大模型 · 多屏矩阵对比台');
  await page.waitForTimeout(1500);

  await smoothMouseMove(page, 600, 450, 600);
  await page.waitForTimeout(1200);
  await smoothMouseMove(page, 1350, 450, 600);
  await page.waitForTimeout(1500);

  // 场景 4: 演示多模型研判与总审官协同中枢
  console.log(`🎬 场景 4: 演示多模型研判与总审官协同中枢...`);
  await updateHUD(page, '👑 场景 4: 独家多模型研判 · 独立总审官裁决');
  await page.waitForTimeout(2500);

  // 场景 5: 切换到【文件转换】与生态
  console.log(`🎬 场景 5: 切换文件转换与生态矩阵...`);
  await page.goto(`${TARGET_URL}/convert`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await injectVirtualCursor(page);
  await updateHUD(page, '🔄 场景 5: Convertio 全能文件转换 · 驱动网络一站通');
  await page.waitForTimeout(2000);

  // 回到主页完美收尾
  console.log(`🎬 场景 6: 返回主页定格...`);
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await injectVirtualCursor(page);
  await updateHUD(page, '🚀 AI万能工具箱 · 重夺你的 10 倍效率');
  await smoothMouseMove(page, 960, 540, 500);
  await page.waitForTimeout(2500);

  console.log(`💾 正在完成视频编码与封装...`);
  await page.close();
  await context.close();
  await browser.close();

  const files = fs.readdirSync(videosDir).filter(f => f.endsWith('.webm') || f.endsWith('.mp4'));
  if (files.length > 0) {
    const latestFile = files[files.length - 1];
    const sourcePath = path.join(videosDir, latestFile);
    console.log(`\n🎉 自动化录制成功完成！`);
    console.log(`📹 视频生成位置: ${sourcePath}`);
  }
}

runAutoRecord().catch(err => {
  console.error('❌ 录制执行失败:', err);
  process.exit(1);
});
