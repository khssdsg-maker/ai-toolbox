import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const seriesDir = path.join(projectRoot, 'videos', 'feature-series');
const audioDir = path.join(projectRoot, 'videos', 'audio');

if (!fs.existsSync(seriesDir)) {
  fs.mkdirSync(seriesDir, { recursive: true });
}

const TARGET_URL = 'http://localhost:3000';

console.log(`=======================================================`);
console.log(`🎬 [AI万能工具箱] 5 大功能独立专题视频录制流水线`);
console.log(`🎙️ 搭载: Edge-TTS 神经网络解说 + 💬 互动弹幕 + 🎥 Shotcraft 运镜`);
console.log(`📁 视频输出目录: ${seriesDir}`);
console.log(`=======================================================\n`);

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// 弹幕库数据字典
const DANMAKU_POOLS = {
  "01-arena": [
    "🔥 四宫格同台对比太爽了！",
    "✨ DeepSeek R1 对决 ChatGPT-4o 现场！",
    "🚀 居然彻底避开了防嵌套风控，牛逼！",
    "💡 不用开十几个网页来回切了",
    "👏 自由拖拽分屏，爱了爱了",
    "⚡ 终于等到这个神器了！"
  ],
  "02-judgment": [
    "👑 独立总审官大模型裁决太绝了！",
    "📄 全平台正文自动提取，省了多少复制粘贴",
    "🎯 冲突分析一针见血！",
    "🔥 二轮定向攻坚派发吹爆！",
    "🏆 这才是多模型协同的终极形态",
    "💯 生产力直接翻倍！"
  ],
  "03-prompts": [
    "🌟 11 大顶尖 Prompt 平台全收录！",
    "📝 动态参数填空太方便了",
    "⚔️ 一键直达分屏对比台！",
    "🎨 网文写作和代码模板太实用了",
    "✨ 小白也能秒变提示词大师"
  ],
  "04-translate": [
    "🌐 全网首创常驻全自动动态翻译！",
    "⚡ 切换 Tab 毫秒级汉化",
    "📚 看英文大模型和开发文档无压力了",
    "🔄 跨页面跳转居然不丢翻译状态！",
    "🎉 彻底告别每次手动点翻译"
  ],
  "05-ecosystem": [
    "🛠️ Convertio 全能文件转换直接内嵌！",
    "⚡ 驱动官方下载一键直达",
    "📦 桌面端安装包居然才 300MB",
    "🚀 零闪烁缓存速度起飞！",
    "⭐ GitHub 已星标支持！"
  ]
};

// 注入 UI 视效、弹幕引擎与 Shotcraft 运镜视口
async function injectStudioEngines(page, audioKey, title, subtitle) {
  try {
    await page.addStyleTag({
      content: `
        /* 虚拟光标 */
        #virtual-cursor {
          position: fixed;
          width: 24px;
          height: 24px;
          pointer-events: none;
          z-index: 999999;
          transform: translate(-2px, -2px);
          transition: transform 0.04s linear;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6));
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
          100% { transform: translate(-50%, -50%) scale(2.4); opacity: 0; border-color: #4facfe; }
        }

        /* 顶部专题精讲 HUD 卡片 */
        #studio-hud-banner {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%) translateY(-20px);
          background: rgba(10, 15, 29, 0.9);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(0, 242, 254, 0.4);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 242, 254, 0.25);
          color: #f8fafc;
          padding: 12px 32px;
          border-radius: 40px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          z-index: 999990;
          display: flex;
          align-items: center;
          gap: 16px;
          opacity: 0;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        #studio-hud-banner.show {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        #studio-hud-banner .badge {
          padding: 4px 14px;
          border-radius: 20px;
          background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
          color: #050811;
          font-weight: 800;
          font-size: 14px;
          letter-spacing: 1px;
        }
        #studio-hud-banner .main-text {
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
        }
        #studio-hud-banner .sub-text {
          font-size: 14px;
          color: #94a3b8;
        }

        /* 弹幕流容器与样式 */
        .danmaku-item {
          position: fixed;
          right: -400px;
          white-space: nowrap;
          padding: 8px 20px;
          border-radius: 30px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 8px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
          z-index: 999980;
          pointer-events: none;
          animation: flyAcross 7.5s linear forwards;
        }
        .danmaku-item.gold {
          border-color: rgba(246, 211, 101, 0.6);
          color: #ffeaa7;
          box-shadow: 0 0 16px rgba(246, 211, 101, 0.3);
        }
        .danmaku-item.cyan {
          border-color: rgba(0, 242, 254, 0.6);
          color: #00f2fe;
          box-shadow: 0 0 16px rgba(0, 242, 254, 0.3);
        }
        @keyframes flyAcross {
          0% { transform: translateX(0); opacity: 0; }
          5% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(-2400px); opacity: 0; }
        }

        /* Video-Shotcraft 3D 运镜视口包装 */
        html, body {
          perspective: 1400px;
          overflow-x: hidden;
        }
        #__next, #root, body > div:first-child {
          transform-origin: 50% 50%;
          transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
      `
    });

    // 注入 DOM 元素
    await page.evaluate(({ title, subtitle }) => {
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

      if (!document.getElementById('studio-hud-banner')) {
        const banner = document.createElement('div');
        banner.id = 'studio-hud-banner';
        banner.innerHTML = `
          <span class="badge">FEATURE FOCUS</span>
          <div>
            <span class="main-text">${title}</span>
            <span class="sub-text"> · ${subtitle}</span>
          </div>
        `;
        document.body.appendChild(banner);
        setTimeout(() => banner.classList.add('show'), 300);
      }
    }, { title, subtitle });

    // 注入并播放 TTS 音频 (如果可用)
    const audioPath = path.join(audioDir, `${audioKey}.mp3`);
    if (fs.existsSync(audioPath)) {
      const audioBase64 = fs.readFileSync(audioPath).toString('base64');
      await page.evaluate((b64) => {
        const audio = new Audio(`data:audio/mp3;base64,${b64}`);
        audio.volume = 0.9;
        audio.play().catch(() => {});
      }, audioBase64);
    }

    // 启动弹幕发生器
    const danmakus = DANMAKU_POOLS[audioKey] || [];
    page.evaluate((items) => {
      items.forEach((text, idx) => {
        setTimeout(() => {
          const d = document.createElement('div');
          const types = ['', 'cyan', 'gold'];
          const chosen = types[idx % types.length];
          d.className = `danmaku-item ${chosen}`;
          d.style.top = `${80 + (idx % 4) * 45}px`;
          d.textContent = text;
          document.body.appendChild(d);
          setTimeout(() => d.remove(), 8000);
        }, 1200 + idx * 2400);
      });
    }, danmakus);

  } catch (e) {}
}

// Shotcraft 镜头运镜函数
async function shotcraftMove(page, { scale = 1, xPercent = 50, yPercent = 50, rotateX = 0, rotateY = 0, durationMs = 800 }) {
  try {
    await page.evaluate(({ scale, xPercent, yPercent, rotateX, rotateY, durationMs }) => {
      const target = document.querySelector('#__next') || document.querySelector('#root') || document.body.firstElementChild;
      if (target) {
        target.style.transition = `transform ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1)`;
        target.style.transformOrigin = `${xPercent}% ${yPercent}%`;
        target.style.transform = `scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }
    }, { scale, xPercent, yPercent, rotateX, rotateY, durationMs });
    await page.waitForTimeout(durationMs);
  } catch (e) {}
}

// 模拟鼠标平滑滑动
let curX = 960, curY = 540;
async function smoothMove(page, targetX, targetY, durationMs = 500) {
  try {
    const steps = Math.max(12, Math.floor(durationMs / 25));
    const startX = curX, startY = curY;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const ease = easeInOutCubic(t);
      const x = startX + (targetX - startX) * ease;
      const y = startY + (targetY - startY) * ease;
      await page.mouse.move(x, y);
      await page.evaluate(({ cx, cy }) => {
        const cur = document.getElementById('virtual-cursor');
        if (cur) { cur.style.left = `${cx}px`; cur.style.top = `${cy}px`; }
      }, { cx: x, cy: y }).catch(() => {});
      await page.waitForTimeout(durationMs / steps);
    }
    curX = targetX; curY = targetY;
  } catch (e) {}
}

async function smoothClick(page, targetX, targetY) {
  await smoothMove(page, targetX, targetY, 400);
  await page.evaluate(({ cx, cy }) => {
    const r = document.createElement('div');
    r.className = 'click-ripple';
    r.style.left = `${cx}px`; r.style.top = `${cy}px`;
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 600);
  }, { cx: targetX, cy: targetY }).catch(() => {});
  await page.mouse.click(targetX, targetY);
  await page.waitForTimeout(200);
}

// 基础浏览器初始化
async function createRecorderContext() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--window-size=1920,1080', '--no-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: { dir: seriesDir, size: { width: 1920, height: 1080 } }
  });
  return { browser, context };
}

// ==================== 5 大独立专题录制 ====================

// 专题 1: AI 大模型分屏对比台 (/arena)
async function recordVideo01() {
  console.log(`\n▶️ [1/5] 正在录制: 01-arena-multiscreen (AI 大模型分屏对比台)...`);
  const { browser, context } = await createRecorderContext();
  const page = await context.newPage();

  await page.goto(`${TARGET_URL}/arena`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await injectStudioEngines(page, '01-arena', 'AI 大模型分屏对比台', '10+ 顶流模型同台竞技 · 沙箱反风控');

  // Shotcraft 运镜 1: 全景微俯角
  await shotcraftMove(page, { scale: 1.02, rotateX: 2, durationMs: 800 });
  await page.waitForTimeout(1500);

  // 鼠标移动到模型切换栏
  await smoothMove(page, 960, 180, 600);
  await page.waitForTimeout(1000);

  // Shotcraft 运镜 2: 镜头平滑推近至四宫格左侧
  await shotcraftMove(page, { scale: 1.15, xPercent: 30, yPercent: 40, durationMs: 1000 });
  await smoothMove(page, 550, 420, 600);
  await page.waitForTimeout(2500);

  // Shotcraft 运镜 3: 镜头横移平扫至右侧模型
  await shotcraftMove(page, { scale: 1.15, xPercent: 70, yPercent: 40, durationMs: 1200 });
  await smoothMove(page, 1350, 420, 700);
  await page.waitForTimeout(2500);

  // Shotcraft 运镜 4: 镜头恢复全景定格
  await shotcraftMove(page, { scale: 1.0, xPercent: 50, yPercent: 50, durationMs: 900 });
  await smoothMove(page, 960, 540, 500);
  await page.waitForTimeout(2500);

  await page.close();
  await context.close();
  await browser.close();
  console.log(`✅ [1/5] 01-arena 录制完成！`);
}

// 专题 2: 独家多模型研判协同中枢 (v1.5.2)
async function recordVideo02() {
  console.log(`\n▶️ [2/5] 正在录制: 02-multi-model-judgment (双区多模型研判协同)...`);
  const { browser, context } = await createRecorderContext();
  const page = await context.newPage();

  await page.goto(`${TARGET_URL}/arena`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await injectStudioEngines(page, '02-judgment', '双区多模型研判协同中枢', 'v1.5.2 独家 · 独立总审官冲突裁决');

  await shotcraftMove(page, { scale: 1.05, durationMs: 800 });
  await page.waitForTimeout(1500);

  // Shotcraft 运镜 1: 特写左侧原始答卷池
  await shotcraftMove(page, { scale: 1.2, xPercent: 25, yPercent: 50, durationMs: 1000 });
  await smoothMove(page, 450, 500, 600);
  await page.waitForTimeout(2500);

  // Shotcraft 运镜 2: 镜头平滑横移至右侧【独立总审官】视窗
  await shotcraftMove(page, { scale: 1.25, xPercent: 80, yPercent: 50, durationMs: 1200 });
  await smoothMove(page, 1450, 480, 700);
  await page.waitForTimeout(3000);

  // 模拟点击派发第二轮攻坚
  await smoothClick(page, 1450, 600);
  await page.waitForTimeout(1500);

  // Shotcraft 运镜 3: 恢复全貌定格
  await shotcraftMove(page, { scale: 1.0, xPercent: 50, yPercent: 50, durationMs: 900 });
  await page.waitForTimeout(2000);

  await page.close();
  await context.close();
  await browser.close();
  console.log(`✅ [2/5] 02-judgment 录制完成！`);
}

// 专题 3: AI 提示词灵感宝典 (/prompts)
async function recordVideo03() {
  console.log(`\n▶️ [3/5] 正在录制: 03-prompt-master-hub (提示词灵感宝典)...`);
  const { browser, context } = await createRecorderContext();
  const page = await context.newPage();

  await page.goto(`${TARGET_URL}/prompts`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await injectStudioEngines(page, '03-prompts', 'AI 提示词灵感宝典', '11大顶尖平台 · 5大高频场景动态直通');

  // 平滑滚动展示多样化卡片
  await smoothMove(page, 960, 450, 500);
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(1500);

  // Shotcraft 运镜: 聚焦高频模板卡片
  await shotcraftMove(page, { scale: 1.18, xPercent: 50, yPercent: 55, durationMs: 900 });
  await smoothMove(page, 960, 520, 500);
  await page.waitForTimeout(2500);

  await page.mouse.wheel(0, -300);
  await shotcraftMove(page, { scale: 1.0, xPercent: 50, yPercent: 50, durationMs: 800 });
  await page.waitForTimeout(2000);

  await page.close();
  await context.close();
  await browser.close();
  console.log(`✅ [3/5] 03-prompts 录制完成！`);
}

// 专题 4: 全自动常驻动态网页翻译
async function recordVideo04() {
  console.log(`\n▶️ [4/5] 正在录制: 04-auto-web-translator (全自动常驻网页翻译)...`);
  const { browser, context } = await createRecorderContext();
  const page = await context.newPage();

  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await injectStudioEngines(page, '04-translate', '全自动常驻网页翻译引擎', 'SPA 动态 DOM 监听 · 跨页状态继承');

  await shotcraftMove(page, { scale: 1.08, yPercent: 30, durationMs: 800 });
  await smoothMove(page, 960, 300, 600);
  await page.waitForTimeout(2500);

  // 演示切页不丢失状态
  await page.goto(`${TARGET_URL}/prompts`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(800);
  await injectStudioEngines(page, '04-translate', '全自动常驻网页翻译引擎', '站内跳转自动翻译 · 毫秒级汉化');

  await shotcraftMove(page, { scale: 1.15, xPercent: 50, yPercent: 40, durationMs: 900 });
  await smoothMove(page, 960, 500, 600);
  await page.waitForTimeout(2500);

  await shotcraftMove(page, { scale: 1.0, durationMs: 700 });
  await page.waitForTimeout(1500);

  await page.close();
  await context.close();
  await browser.close();
  console.log(`✅ [4/5] 04-translate 录制完成！`);
}

// 专题 5: Convertio 格式转换与超级生态
async function recordVideo05() {
  console.log(`\n▶️ [5/5] 正在录制: 05-universal-ecosystem (全能文件转换与超级生态)...`);
  const { browser, context } = await createRecorderContext();
  const page = await context.newPage();

  await page.goto(`${TARGET_URL}/convert`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await injectStudioEngines(page, '05-ecosystem', '一站式超级生产力生态', 'Convertio 格式转换 · 驱动网络一网打尽');

  await shotcraftMove(page, { scale: 1.1, yPercent: 45, durationMs: 800 });
  await smoothMove(page, 960, 480, 600);
  await page.waitForTimeout(2500);

  // 切换驱动工具
  await page.goto(`${TARGET_URL}/drivers`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(800);
  await injectStudioEngines(page, '05-ecosystem', '驱动与精选网络工具', '免翻墙高速 CDN · 本地零闪烁缓存');

  await shotcraftMove(page, { scale: 1.12, xPercent: 45, yPercent: 40, durationMs: 900 });
  await smoothMove(page, 960, 450, 600);
  await page.waitForTimeout(2500);

  // 回到主页完美定格
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(600);
  await injectStudioEngines(page, '05-ecosystem', 'AI万能工具箱', '重塑你的日常全能工作流');
  await shotcraftMove(page, { scale: 1.0, durationMs: 800 });
  await page.waitForTimeout(2000);

  await page.close();
  await context.close();
  await browser.close();
  console.log(`✅ [5/5] 05-ecosystem 录制完成！`);
}

// 统一执行器与文件标准化命名
async function runAll() {
  await recordVideo01();
  await recordVideo02();
  await recordVideo03();
  await recordVideo04();
  await recordVideo05();

  console.log(`\n🎬 正在整理与标准化 5 支专题视频文件...`);
  const rawFiles = fs.readdirSync(seriesDir).filter(f => f.startsWith('page@') && f.endsWith('.webm'));
  
  const names = [
    '01-arena-multiscreen.webm',
    '02-multi-model-judgment.webm',
    '03-prompt-master-hub.webm',
    '04-auto-web-translator.webm',
    '05-universal-ecosystem.webm'
  ];

  rawFiles.forEach((rf, idx) => {
    if (idx < names.length) {
      const src = path.join(seriesDir, rf);
      const dst = path.join(seriesDir, names[idx]);
      fs.copyFileSync(src, dst);
      fs.unlinkSync(src);
      console.log(`  🎁 [标准化完成] ${names[idx]}`);
    }
  });

  console.log(`\n🎉 恭喜！全部 5 大功能专属精讲视频已全部制作完成！`);
}

runAll().catch(err => {
  console.error('❌ 执行错误:', err);
  process.exit(1);
});
