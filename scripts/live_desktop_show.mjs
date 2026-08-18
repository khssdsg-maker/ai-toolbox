import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const videosDir = path.join(projectRoot, 'videos');
const audioDir = path.join(videosDir, 'audio');
const voiceoverPath = path.join(audioDir, 'live-showcase-voiceover.mp3');

if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

const TARGET_URL = 'http://localhost:3000';

console.log(`=======================================================`);
console.log(`🖥️  [真机实控 + 扬声器实时外放解说 + 音画同步合成] 启动！`);
console.log(`🔊 本次演示已开启物理扬声器外放解说声，请调大电脑音量`);
console.log(`=======================================================\n`);

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

let curX = 960, curY = 540;

async function smoothMove(page, targetX, targetY, durationMs = 600) {
  try {
    const steps = Math.max(15, Math.floor(durationMs / 20));
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
  await smoothMove(page, targetX, targetY, 450);
  await page.evaluate(({ cx, cy }) => {
    const r = document.createElement('div');
    r.className = 'click-ripple';
    r.style.left = `${cx}px`; r.style.top = `${cy}px`;
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 600);
  }, { cx: targetX, cy: targetY }).catch(() => {});
  await page.mouse.click(targetX, targetY);
  await page.waitForTimeout(300);
}

async function humanType(page, text) {
  for (const char of text) {
    await page.keyboard.type(char);
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(400);
}

async function injectEffects(page) {
  try {
    await page.addStyleTag({
      content: `
        #virtual-cursor {
          position: fixed;
          width: 28px;
          height: 28px;
          pointer-events: none;
          z-index: 999999;
          transform: translate(-2px, -2px);
          transition: transform 0.03s linear;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6));
        }
        .click-ripple {
          position: fixed;
          width: 50px;
          height: 50px;
          border: 3px solid #00f2fe;
          border-radius: 50%;
          pointer-events: none;
          z-index: 999998;
          transform: translate(-50%, -50%) scale(0.2);
          opacity: 1;
          animation: rippleEffect 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes rippleEffect {
          0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; border-color: #00f2fe; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; border-color: #4facfe; }
        }
        #live-hud-badge {
          position: fixed;
          bottom: 40px;
          right: 60px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(24px);
          border: 1.5px solid rgba(0, 242, 254, 0.5);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 242, 254, 0.3);
          color: #f8fafc;
          padding: 14px 32px;
          border-radius: 40px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 18px;
          font-weight: 700;
          z-index: 999990;
          display: flex;
          align-items: center;
          gap: 14px;
        }
      `
    });

    await page.evaluate(() => {
      if (!document.getElementById('virtual-cursor')) {
        const cursor = document.createElement('div');
        cursor.id = 'virtual-cursor';
        cursor.innerHTML = `
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.5 3.2L18.5 13.8L12.2 14.5L15.8 20.8L13.2 22.2L9.6 16.0L5.5 19.5V3.2Z" fill="#00f2fe" stroke="#050811" stroke-width="1.6" stroke-linejoin="round"/>
          </svg>
        `;
        document.body.appendChild(cursor);
      }
      if (!document.getElementById('live-hud-badge')) {
        const hud = document.createElement('div');
        hud.id = 'live-hud-badge';
        hud.innerHTML = `<span>🔊 正在同步外放解说演示中...</span>`;
        document.body.appendChild(hud);
      }
    });
  } catch (e) {}
}

async function runLiveShow() {
  // 获取完整版 FFmpeg 路径
  let ffmpegExe = '';
  try {
    ffmpegExe = execSync('python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"')
      .toString()
      .trim();
  } catch (e) {}

  // 1. 启动 Windows 系统级音频外放（确保扬声器 100% 能听见）
  console.log(`🎙️ 正在启动扬声器外放科技解说声...`);
  try {
    // 启动独立 Python 音频播放进程持续外放
    spawn('python', ['-c', `
import time
import imageio_ffmpeg
import subprocess

audio_path = r'${voiceoverPath.replace(/\\/g, '\\\\')}'
try:
    import pygame
    pygame.mixer.init()
    pygame.mixer.music.load(audio_path)
    pygame.mixer.music.play()
    while pygame.mixer.music.get_busy():
        time.sleep(0.5)
except Exception:
    # 备用方案：调用 Windows Media Player COM 播放
    subprocess.run(['powershell', '-c', f'''
        $wmp = New-Object -ComObject wmplayer.ocx
        $wmp.URL = "{audio_path}"
        $wmp.controls.play()
        Start-Sleep -Seconds 28
    '''], shell=True)
`], { detached: true, stdio: 'ignore' });
  } catch (e) {}

  // 2. 启动前台可视化 Chromium 窗口
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--start-maximized',
      '--autoplay-policy=no-user-gesture-required',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox'
    ]
  });

  const context = await browser.newContext({
    viewport: null,
    recordVideo: {
      dir: videosDir,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  console.log(`[1/5] 正在打开《AI万能工具箱》前台窗口...`);
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await injectEffects(page);

  // 浏览器内部也启动音频播放（双重外放保障）
  try {
    if (fs.existsSync(voiceoverPath)) {
      const b64 = fs.readFileSync(voiceoverPath).toString('base64');
      await page.evaluate((data) => {
        const a = new Audio(`data:audio/mp3;base64,${data}`);
        a.volume = 1.0;
        a.play().catch(() => {});
      }, b64);
    }
  } catch (e) {}

  // 场景 1: 首页搜索
  console.log(`[2/5] 正在前台操控：搜索 DeepSeek...`);
  const searchInput = 'input[placeholder*="搜索"], input[type="search"], input[type="text"]';
  try {
    const el = await page.$(searchInput);
    if (el) {
      const box = await el.boundingBox();
      if (box) {
        await smoothClick(page, box.x + box.width / 2, box.y + box.height / 2);
        await humanType(page, 'DeepSeek');
        await page.waitForTimeout(2000);
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Backspace');
        await page.waitForTimeout(1000);
      }
    }
  } catch (e) {}

  // 场景 2: 提示词灵感宝典
  console.log(`[3/5] 正在前台操控：跳转提示词灵感宝典...`);
  await page.goto(`${TARGET_URL}/prompts`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await injectEffects(page);
  await smoothMove(page, 960, 480, 600);
  await page.mouse.wheel(0, 320);
  await page.waitForTimeout(2500);
  await page.mouse.wheel(0, -320);
  await page.waitForTimeout(1500);

  // 场景 3: 大模型分屏对比台
  console.log(`[4/5] 正在前台操控：跳转 AI 大模型分屏对比台 (/arena)...`);
  await page.goto(`${TARGET_URL}/arena`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await injectEffects(page);
  await smoothMove(page, 650, 450, 700);
  await page.waitForTimeout(3000);
  await smoothMove(page, 1350, 450, 700);
  await page.waitForTimeout(3500);

  // 场景 4: 返回主页完成演示
  console.log(`[5/5] 正在前台操控：返回主页完成实机演示...`);
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await injectEffects(page);
  await smoothMove(page, 960, 540, 600);
  await page.waitForTimeout(3000);

  console.log(`💾 演示操作完成，正在封包视频...`);
  await page.close();
  await context.close();
  await browser.close();

  // 整理视频并使用 FFmpeg 合成音画
  const files = fs.readdirSync(videosDir).filter(f => f.startsWith('page@') && f.endsWith('.webm'));
  if (files.length > 0) {
    const rawWebm = path.join(videosDir, files[files.length - 1]);
    const finalMp4 = path.join(videosDir, 'real-desktop-live-showcase.mp4');
    
    if (ffmpegExe && fs.existsSync(voiceoverPath)) {
      console.log(`🎬 正在使用 FFmpeg 将视频画面与解说音频进行专业音画合成...`);
      try {
        const cmd = `"${ffmpegExe}" -y -i "${rawWebm}" -i "${voiceoverPath}" -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest "${finalMp4}"`;
        execSync(cmd, { stdio: 'inherit' });
        console.log(`\n🎉 音画合成成功！`);
        console.log(`📹 带有清晰解说声的最终 MP4 视频: ${finalMp4}`);
      } catch (err) {
        console.error('音画合成错误:', err.message);
      }
    }
    try { fs.unlinkSync(rawWebm); } catch (e) {}
  }
}

runLiveShow().catch(err => {
  console.error('❌ 执行失败:', err);
  process.exit(1);
});
