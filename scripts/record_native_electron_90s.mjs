import { _electron as electron } from 'playwright';
import path from 'path';
import fs from 'fs';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const videosDir = path.join(projectRoot, 'videos');
const audioDir = path.join(videosDir, 'audio');
const voiceover90sPath = path.join(audioDir, 'showcase-90s-voiceover.mp3');

if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

console.log(`========================================================================`);
console.log(`🖥️  [AI万能工具箱] 原生 Electron 本地桌面客户端 · 真机多页面实操录制`);
console.log(`🚀 严谨多路由切换 + 深度功能点击 + 扬声器外放解说 + FFmpeg 音画混流`);
console.log(`========================================================================\n`);

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

let curX = 960, curY = 540;

async function fastMove(page, targetX, targetY, durationMs = 350) {
  try {
    const steps = Math.max(8, Math.floor(durationMs / 25));
    const startX = curX, startY = curY;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const ease = easeInOutQuad(t);
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

async function fastClick(page, selectorOrBox, clickDelayMs = 250) {
  try {
    let targetX, targetY;
    if (typeof selectorOrBox === 'string') {
      const el = await page.waitForSelector(selectorOrBox, { state: 'visible', timeout: 5000 });
      const box = await el.boundingBox();
      if (!box) return;
      targetX = box.x + box.width / 2;
      targetY = box.y + box.height / 2;
    } else if (selectorOrBox && typeof selectorOrBox === 'object') {
      targetX = selectorOrBox.x + (selectorOrBox.width ? selectorOrBox.width / 2 : 0);
      targetY = selectorOrBox.y + (selectorOrBox.height ? selectorOrBox.height / 2 : 0);
    } else {
      return;
    }

    await fastMove(page, targetX, targetY, 300);
    await page.evaluate(({ cx, cy }) => {
      const r = document.createElement('div');
      r.className = 'click-ripple';
      r.style.left = `${cx}px`; r.style.top = `${cy}px`;
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 500);
    }, { cx: targetX, cy: targetY }).catch(() => {});

    await page.mouse.click(targetX, targetY);
    await page.waitForTimeout(clickDelayMs);
  } catch (e) {}
}

async function fastType(page, text, intervalMs = 65) {
  for (const char of text) {
    await page.keyboard.type(char);
    await page.waitForTimeout(intervalMs);
  }
  await page.waitForTimeout(200);
}

async function injectFastHUD(page, title, sub) {
  try {
    await page.addStyleTag({
      content: `
        #virtual-cursor {
          position: fixed;
          width: 26px;
          height: 26px;
          pointer-events: none;
          z-index: 999999;
          transform: translate(-2px, -2px);
          transition: transform 0.02s linear;
          filter: drop-shadow(0 3px 10px rgba(0, 0, 0, 0.7));
        }
        .click-ripple {
          position: fixed;
          width: 48px;
          height: 48px;
          border: 2.5px solid #00f2fe;
          border-radius: 50%;
          pointer-events: none;
          z-index: 999998;
          transform: translate(-50%, -50%) scale(0.2);
          opacity: 1;
          animation: rippleEffect 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes rippleEffect {
          0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; border-color: #00f2fe; }
          100% { transform: translate(-50%, -50%) scale(2.4); opacity: 0; border-color: #4facfe; }
        }
        #fast-hud-badge {
          position: fixed;
          top: 24px;
          right: 36px;
          background: rgba(10, 15, 29, 0.94);
          backdrop-filter: blur(24px);
          border: 1.5px solid rgba(0, 242, 254, 0.5);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), 0 0 24px rgba(0, 242, 254, 0.3);
          color: #f8fafc;
          padding: 10px 24px;
          border-radius: 40px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          z-index: 999990;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        #fast-hud-badge .tag {
          padding: 4px 12px;
          border-radius: 20px;
          background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
          color: #050811;
          font-weight: 800;
          font-size: 13px;
        }
        #fast-hud-badge .title { font-size: 16px; font-weight: 700; color: #fff; }
        #fast-hud-badge .sub { font-size: 13px; color: #94a3b8; }
      `
    });

    await page.evaluate(({ title, sub }) => {
      if (!document.getElementById('virtual-cursor')) {
        const cursor = document.createElement('div');
        cursor.id = 'virtual-cursor';
        cursor.innerHTML = `
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.5 3.2L18.5 13.8L12.2 14.5L15.8 20.8L13.2 22.2L9.6 16.0L5.5 19.5V3.2Z" fill="#00f2fe" stroke="#050811" stroke-width="1.6" stroke-linejoin="round"/>
          </svg>
        `;
        document.body.appendChild(cursor);
      }
      let hud = document.getElementById('fast-hud-badge');
      if (!hud) {
        hud = document.createElement('div');
        hud.id = 'fast-hud-badge';
        document.body.appendChild(hud);
      }
      hud.innerHTML = `
        <span class="tag">DESKTOP APP</span>
        <div><span class="title">${title}</span><span class="sub"> · ${sub}</span></div>
      `;
    }, { title, sub });
  } catch (e) {}
}

async function recordNativeElectronApp() {
  // 清理旧缓存视频
  fs.readdirSync(videosDir).forEach(f => {
    if (f.startsWith('page@')) fs.unlinkSync(path.join(videosDir, f));
  });

  // 1. 扬声器外放解说
  console.log(`🎙️ 正在启动扬声器同步高能解说外放...`);
  try {
    spawn('python', ['-c', `
import time
import imageio_ffmpeg
import subprocess

audio_path = r'${voiceover90sPath.replace(/\\/g, '\\\\')}'
try:
    import pygame
    pygame.mixer.init()
    pygame.mixer.music.load(audio_path)
    pygame.mixer.music.play()
    while pygame.mixer.music.get_busy():
        time.sleep(0.3)
except Exception:
    subprocess.run(['powershell', '-c', f'''
        $wmp = New-Object -ComObject wmplayer.ocx
        $wmp.URL = "{audio_path}"
        $wmp.controls.play()
        Start-Sleep -Seconds 80
    '''], shell=True)
`], { detached: true, stdio: 'ignore' });
  } catch (e) {}

  console.log(`🖥️  正在调用本地 electron/main.mjs 启动原生桌面客户端...`);
  const app = await electron.launch({
    args: ['electron/main.mjs'],
    cwd: projectRoot,
    recordVideo: {
      dir: videosDir,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await app.firstWindow();
  console.log(`✅ 本地原生客户端已成功弹出！窗口标题: ${await page.title()}`);

  const startTime = Date.now();
  console.log(`⏱️ 录制开始！目标时长: 76 秒 (严格对齐 1分15秒音轨)...`);

  // ==================== 第 1 幕：原生客户端首页生态 (0s - 15s) ====================
  console.log(`▶️ [第 1 幕 | 0s - 15s] 首页 7 大核心分类与极速筛选...`);
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await injectFastHUD(page, '本地桌面客户端', '7大分类 · 开源与大厂全收录 · 秒级直达');

  // 点击左侧侧边栏中的【AI写作与小说生成】分类
  try {
    const novelNav = await page.$('button:has-text("写作"), div:has-text("写作")');
    if (novelNav) {
      await fastClick(page, novelNav);
      await page.waitForTimeout(1200);
    }
  } catch (e) {}

  // 点击【AI编程工具】分类
  try {
    const codeNav = await page.$('button:has-text("编程"), div:has-text("编程")');
    if (codeNav) {
      await fastClick(page, codeNav);
      await page.waitForTimeout(1200);
    }
  } catch (e) {}

  // 搜索框输入 Claude 并清除
  const searchInput = 'input[placeholder*="搜索"], input[type="search"], input[type="text"]';
  try {
    await fastClick(page, searchInput);
    await fastType(page, 'Claude', 70);
    await page.waitForTimeout(1200);
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(600);
  } catch (e) {}

  // ==================== 第 2 幕：AI 提示词灵感宝典 (15s - 28s) ====================
  console.log(`▶️ [第 2 幕 | 15s - 28s] 跳转进入【提示词宝典】页面...`);
  await page.goto('http://localhost:3000/prompts', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  await injectFastHUD(page, '提示词灵感宝典', '11大平台 · 动态参数一键秒传直达');

  // 慢速滚屏
  await page.evaluate(() => window.scrollBy({ top: 320, behavior: 'smooth' }));
  await page.waitForTimeout(1200);

  // 展开输入框并填入参数
  try {
    const varInputs = await page.$$('input[placeholder*="默认值"], input[placeholder*="参数"], input.bg-background');
    if (varInputs.length > 0) {
      await fastClick(page, varInputs[0]);
      await page.keyboard.press('Control+A');
      await fastType(page, '高并发微服务中台重构', 60);
      await page.waitForTimeout(1000);
    }
  } catch (e) {}

  // ==================== 第 3 幕：AI 大模型分屏对比台 (/arena) (28s - 45s) ====================
  console.log(`▶️ [第 3 幕 | 28s - 45s] 带着 Prompt 跳转进入【大模型分屏对比台】...`);
  await page.goto('http://localhost:3000/arena?prompt=%E5%BE%AE%E6%9C%8D%E5%8A%A1%E9%AB%98%E5%B9%B6%E5%8F%91%E4%B8%AD%E5%8F%B0%E9%87%8D%E6%9E%84', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  await injectFastHUD(page, '大模型分屏对比台', '10+ 顶流大模型 · 双栏/三栏/四宫格');

  // 快速切换布局：三栏 -> 四宫格
  try {
    const buttons = await page.$$('button:has(svg)');
    for (let btn of buttons) {
      const title = await btn.getAttribute('title') || '';
      if (title.includes('三') || title.includes('3')) {
        await fastClick(page, btn);
        await page.waitForTimeout(1500);
        break;
      }
    }
    for (let btn of buttons) {
      const title = await btn.getAttribute('title') || '';
      if (title.includes('四') || title.includes('网格') || title.includes('4')) {
        await fastClick(page, btn);
        await page.waitForTimeout(2000);
        break;
      }
    }
  } catch (e) {}

  // 扫视四宫格
  await fastMove(page, 500, 420, 400);
  await page.waitForTimeout(1500);
  await fastMove(page, 1380, 420, 400);
  await page.waitForTimeout(1500);
  await fastMove(page, 500, 780, 400);
  await page.waitForTimeout(1500);
  await fastMove(page, 1380, 780, 400);
  await page.waitForTimeout(1500);

  // ==================== 第 4 幕：v1.5.2 独家双区研判中枢 (45s - 60s) ====================
  console.log(`▶️ [第 4 幕 | 45s - 60s] 唤起【双区多模型研判中枢】总审官裁决...`);
  await injectFastHUD(page, '双区多模型研判中枢', 'v1.5.2 独家 · 正文自动提取 · 独立总审官裁决');

  try {
    const hubBtn = await page.$('button:has-text("研判"), button:has-text("协同"), button:has-text("分析")');
    if (hubBtn) {
      await fastClick(page, hubBtn);
      await page.waitForTimeout(2000);
    }
  } catch (e) {}

  await fastMove(page, 450, 480, 400);
  await page.waitForTimeout(2500);
  await fastMove(page, 1450, 480, 400);
  await page.waitForTimeout(3000);

  try {
    const round2Btn = await page.$('button:has-text("二轮"), button:has-text("攻坚"), button:has-text("深化")');
    if (round2Btn) {
      await fastClick(page, round2Btn);
      await page.waitForTimeout(2000);
    }
  } catch (e) {}

  // ==================== 第 5 幕：全能实用生态（格式转换与驱动）(60s - 72s) ====================
  console.log(`▶️ [第 5 幕 | 60s - 72s] 跳转进入【格式转换】与【驱动中心】...`);
  await page.goto('http://localhost:3000/convert', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  await injectFastHUD(page, '一站式全能生态', 'Convertio 格式转换 · 驱动官方下载 · 网络工具');
  await fastMove(page, 960, 450, 400);
  await page.waitForTimeout(2000);

  await page.goto('http://localhost:3000/drivers', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  await fastMove(page, 600, 450, 400);
  await page.waitForTimeout(2000);

  // ==================== 第 6 幕：价值总结定格 (72s - 76s) ====================
  console.log(`▶️ [第 6 幕 | 72s - 76s] 返回主页完成全流程收拢...`);
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  await injectFastHUD(page, '开启 10倍效率时代', 'GitHub 开源免费 · 重塑你的日常生产力');
  await fastMove(page, 960, 540, 400);

  const elapsedSec = (Date.now() - startTime) / 1000;
  const remainingSec = Math.max(1, 76 - elapsedSec);
  console.log(`⏳ 已录制 ${elapsedSec.toFixed(1)}s，定格等待剩余 ${remainingSec.toFixed(1)}s 完成精准音画对齐...`);
  await page.waitForTimeout(remainingSec * 1000);

  const videoObj = page.video();
  console.log(`\n💾 原生桌面客户端实操完毕！关闭应用并保存视频...`);
  await app.close();

  let recordedPath = null;
  if (videoObj) {
    recordedPath = await videoObj.path();
    console.log(`📹 捕获到原生多页面切换视频: ${recordedPath}`);
  }

  // FFmpeg 音画混流
  if (recordedPath && fs.existsSync(recordedPath)) {
    const finalMp4 = path.join(videosDir, 'ai-toolbox-native-electron-master.mp4');

    const pythonMuxScript = `
import os
import subprocess
import imageio_ffmpeg

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
v_in = r'${recordedPath.replace(/\\/g, '\\\\')}'
a_in = r'${voiceover90sPath.replace(/\\/g, '\\\\')}'
v_out = r'${finalMp4.replace(/\\/g, '\\\\')}'

cmd = [
    ffmpeg, '-y',
    '-i', v_in,
    '-i', a_in,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    v_out
]
res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
if res.returncode == 0:
    print(f"🎉 真实多页面切换实操版视频生成成功: {v_out} ({os.path.getsize(v_out)} 字节)")
    probe = subprocess.run([ffmpeg, '-i', v_out], capture_output=True, text=True, encoding='utf-8', errors='ignore')
    for line in probe.stderr.split('\\n'):
        if 'Duration' in line:
            print('VERIFIED FINAL DURATION:', line.strip())
`;
    execSync(`python -c "${pythonMuxScript}"`, { stdio: 'inherit' });
  }
}

recordNativeElectronApp().catch(err => {
  console.error('❌ 执行失败:', err);
  process.exit(1);
});
