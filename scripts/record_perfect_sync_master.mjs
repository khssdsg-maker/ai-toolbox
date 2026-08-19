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
const masterVoiceover = path.join(audioDir, 'showcase-120s-voiceover.mp3');

if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

console.log(`========================================================================`);
console.log(`🎬 [AI万能工具箱] 原生桌面客户端 · 深度实操与三栏/总结弹窗强化版 (2分35秒)`);
console.log(`🎙️ 全程对齐 6 大章节音轨 · 完整展示三栏并排与双区研判中枢全景弹窗`);
console.log(`========================================================================\n`);

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

let curX = 960, curY = 540;

async function smoothMove(page, targetX, targetY, durationMs = 350) {
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

async function asyncClick(page, buttonKeyword, targetX, targetY, delayMs = 400) {
  try {
    if (typeof targetX === 'number' && typeof targetY === 'number') {
      await smoothMove(page, targetX, targetY, 300);
      await page.evaluate(({ cx, cy }) => {
        const r = document.createElement('div');
        r.className = 'click-ripple';
        r.style.left = `${cx}px`; r.style.top = `${cy}px`;
        document.body.appendChild(r);
        setTimeout(() => r.remove(), 600);
      }, { cx: targetX, cy: targetY }).catch(() => {});
    }
    
    await page.evaluate((kw) => {
      setTimeout(() => {
        const allBtns = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
        const target = allBtns.find(b => (b.innerText && b.innerText.includes(kw)) || (b.title && b.title.includes(kw)));
        if (target) target.click();
      }, 10);
    }, buttonKeyword).catch(() => {});
    
    await page.waitForTimeout(delayMs);
  } catch (e) {}
}

async function humanType(page, text, intervalMs = 70) {
  for (const char of text) {
    await page.keyboard.type(char);
    await page.waitForTimeout(intervalMs);
  }
  await page.waitForTimeout(250);
}

async function injectMasterHUD(page, title, sub) {
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
          transition: transform 0.02s linear;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.7));
        }
        .click-ripple {
          position: fixed;
          width: 52px;
          height: 52px;
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
          100% { transform: translate(-50%, -50%) scale(2.4); opacity: 0; border-color: #4facfe; }
        }
        #perfect-hud-badge {
          position: fixed;
          top: 24px;
          right: 36px;
          background: rgba(10, 15, 29, 0.94);
          backdrop-filter: blur(24px);
          border: 1.5px solid rgba(0, 242, 254, 0.45);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), 0 0 24px rgba(0, 242, 254, 0.3);
          color: #f8fafc;
          padding: 11px 26px;
          border-radius: 40px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          z-index: 999990;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        #perfect-hud-badge .tag {
          padding: 4px 14px;
          border-radius: 20px;
          background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
          color: #050811;
          font-weight: 800;
          font-size: 13px;
        }
        #perfect-hud-badge .title { font-size: 16px; font-weight: 700; color: #fff; }
        #perfect-hud-badge .sub { font-size: 13px; color: #94a3b8; }
      `
    });

    await page.evaluate(({ title, sub }) => {
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
      let hud = document.getElementById('perfect-hud-badge');
      if (!hud) {
        hud = document.createElement('div');
        hud.id = 'perfect-hud-badge';
        document.body.appendChild(hud);
      }
      hud.innerHTML = `
        <span class="tag">AI TOOLBOX</span>
        <div><span class="title">${title}</span><span class="sub"> · ${sub}</span></div>
      `;
    }, { title, sub });
  } catch (e) {}
}

async function recordPerfectSyncMaster() {
  fs.readdirSync(videosDir).forEach(f => {
    if (f.startsWith('page@')) fs.unlinkSync(path.join(videosDir, f));
  });

  // 1. 扬声器外放完整 2分35秒 音轨
  console.log(`🎙️ 正在启动扬声器同步高保真全流程解说外放...`);
  try {
    spawn('python', ['-c', `
import time
import imageio_ffmpeg
import subprocess

audio_path = r'${masterVoiceover.replace(/\\/g, '\\\\')}'
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
        Start-Sleep -Seconds 160
    '''], shell=True)
`], { detached: true, stdio: 'ignore' });
  } catch (e) {}

  // 2. 唤起原生 Electron 桌面客户端
  console.log(`🖥️  正在调用本地 electron/main.mjs 启动原生客户端...`);
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

  const startTimeline = Date.now();
  console.log(`⏱️ 录制开始！音画严格同步计时启动 (总目标时长: 155 秒)...`);

  // ==================== 第 1 幕：首页超级生态全景 (0.0s - 51.0s | 足足 51 秒) ====================
  console.log(`\n▶️ [第 1 幕 | 0.0s - 51.0s] 首页超级生态全景深度展示...`);
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await injectMasterHUD(page, '第一章：首页超级生态', '7大分类 · 开源与大厂全收录 · 秒级直达');

  // 0s-10s: 顶部全景巡视
  await smoothMove(page, 450, 160, 600);
  await page.waitForTimeout(2500);
  await smoothMove(page, 750, 160, 600);
  await page.waitForTimeout(2500);

  // 10s-20s: 慢速滚动浏览 AI 聊天对话卡片
  console.log(`  -> 慢速滚动浏览 AI 聊天卡片...`);
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
  await smoothMove(page, 500, 420, 600);
  await page.waitForTimeout(3500);

  // 20s-30s: 慢速滚动浏览 AI 写作与小说生成 (SillyTavern, NovelAI)
  console.log(`  -> 慢速滚动浏览 AI 写作与小说生成...`);
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await smoothMove(page, 500, 480, 600);
  await page.waitForTimeout(4000);

  // 30s-40s: 慢速滚动浏览 AI 编程工具 (Cursor, Trae, Antigravity)
  console.log(`  -> 慢速滚动浏览 AI 编程工具...`);
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await smoothMove(page, 850, 480, 600);
  await page.waitForTimeout(4000);

  // 40s-48s: 滚回顶部，真实搜索 Claude 并过滤
  console.log(`  -> 滚回顶部并搜索 Claude...`);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(800);
  const searchInput = 'input[placeholder*="搜索"], input[type="search"], input[type="text"]';
  try {
    const sEl = await page.$(searchInput);
    if (sEl) {
      await smoothMove(page, 960, 90, 350);
      await sEl.click();
      await humanType(page, 'Claude', 75);
      await page.waitForTimeout(1800);
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.waitForTimeout(1000);
    }
  } catch (e) {}

  // 48s-51.0s: 严格等待第 1 幕解说完全播完
  while ((Date.now() - startTimeline) < 51000) {
    await page.waitForTimeout(300);
  }

  // ==================== 第 2 幕：提示词灵感宝典 (51.0s - 78.1s | 足足 27 秒) ====================
  console.log(`\n▶️ [第 2 幕 | 51.0s - 78.1s] 提示词灵感宝典深度实操...`);
  await page.goto('http://localhost:3000/prompts', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  await injectMasterHUD(page, '第二章：提示词灵感宝典', '11大平台 · 5大场景模板 · 动态参数秒级直传');

  // 52s-60s: 巡视 11 大平台
  await smoothMove(page, 960, 240, 600);
  await page.waitForTimeout(3000);

  // 60s-68s: 慢速滚动浏览 5 大场景
  console.log(`  -> 慢速滚动浏览 5 大高频场景卡片...`);
  await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
  await page.waitForTimeout(3500);

  // 68s-75s: 展开输入框并填入业务参数
  console.log(`  -> 展开模板输入框并真实填入业务参数...`);
  try {
    const varInputs = await page.$$('input[placeholder*="默认值"], input[placeholder*="参数"], input.bg-background');
    if (varInputs.length > 0) {
      const box = await varInputs[0].boundingBox();
      if (box) await smoothMove(page, box.x + box.width / 2, box.y + box.height / 2, 350);
      await varInputs[0].click();
      await page.keyboard.press('Control+A');
      await humanType(page, '微服务高并发中台重构与性能调优', 65);
      await page.waitForTimeout(1500);
    }
  } catch (e) {}

  // 75s-78.1s: 严格等待第 2 幕解说念完"一键直传对比台"
  while ((Date.now() - startTimeline) < 78100) {
    await page.waitForTimeout(300);
  }

  // ==================== 第 3 幕：AI 大模型分屏对比台与三栏/四宫格演示 (78.1s - 109.7s | 足足 31.6 秒) ====================
  console.log(`\n▶️ [第 3 幕 | 78.1s - 109.7s] 大模型分屏对比台 · 演示三栏与四宫格切换...`);
  await page.goto('http://localhost:3000/arena?prompt=%E5%BE%AE%E6%9C%8D%E5%8A%A1%E9%AB%98%E5%B9%B6%E5%8F%91%E4%B8%AD%E5%8F%B0%E9%87%8D%E6%9E%84%E4%B8%8E%E6%80%A7%E8%83%BD%E8%B0%83%E4%BC%98', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  await injectMasterHUD(page, '第三章：大模型分屏对比台', '10+ 顶流大模型 · 双栏/三栏/四宫格 · 底层反风控');

  // 79s-85s: 展示顶部 Prompt 与双栏模式
  await smoothMove(page, 960, 140, 500);
  await page.waitForTimeout(2500);

  // 85s-94s: 真实点击【三栏竞速】按钮，展示 3 栏并排！
  console.log(`  -> 真实点击【三栏竞速】按钮...`);
  await asyncClick(page, '三栏', 730, 28, 1200);

  // 扫视三栏
  await smoothMove(page, 450, 480, 400);
  await page.waitForTimeout(1500);
  await smoothMove(page, 960, 480, 400);
  await page.waitForTimeout(1500);
  await smoothMove(page, 1450, 480, 400);
  await page.waitForTimeout(1500);

  // 94s-103s: 真实点击【四宫格矩阵】按钮，展示 4 屏全开！
  console.log(`  -> 真实点击【四宫格矩阵】按钮...`);
  await asyncClick(page, '四宫格', 810, 28, 1200);

  // 103s-109.7s: 扫视四宫格四大顶流模型视窗
  await smoothMove(page, 500, 420, 350);
  await page.waitForTimeout(1200);
  await smoothMove(page, 1380, 420, 350);
  await page.waitForTimeout(1200);
  await smoothMove(page, 500, 780, 350);
  await page.waitForTimeout(1200);
  await smoothMove(page, 1380, 780, 350);

  while ((Date.now() - startTimeline) < 109700) {
    await page.waitForTimeout(300);
  }

  // ==================== 第 4 幕：v1.5.2 独家双区研判协同中枢 (109.7s - 135.8s | 足足 26 秒) ====================
  console.log(`\n▶️ [第 4 幕 | 109.7s - 135.8s] 真正点击【智能总结】弹出双区研判中枢全屏大面板...`);
  await injectMasterHUD(page, '第四章：双区多模型研判中枢', 'v1.5.2 独家 · 正文自动提取 · 独立总审官裁决');

  // 真实点击【🧠 对比智能总结】按钮唤起中枢全屏大弹窗！
  console.log(`  -> 点击【🧠 对比智能总结】唤起全屏大弹窗...`);
  await asyncClick(page, '智能总结', 1780, 1020, 2000);

  // 慢速展示左侧主屏原始答卷池（各模型切换与字数统计）
  console.log(`  -> 慢速展示左侧【主屏原始答卷池】...`);
  await smoothMove(page, 450, 480, 600);
  await page.waitForTimeout(4500);

  // 慢速展示右侧独立总审官大模型（深度剖析与冲突裁决）
  console.log(`  -> 慢速展示右侧【独立总审官大模型】...`);
  await smoothMove(page, 1400, 480, 600);
  await page.waitForTimeout(5000);

  // 点击二轮攻坚 / 第 2 轮标签
  console.log(`  -> 点击第 2 轮终审标签...`);
  await asyncClick(page, '第 2 轮', 1100, 48, 1500);

  while ((Date.now() - startTimeline) < 135800) {
    await page.waitForTimeout(300);
  }

  // ==================== 第 5 幕：全能实用生态与设置 (135.8s - 148.7s | 13 秒) ====================
  console.log(`\n▶️ [第 5 幕 | 135.8s - 148.7s] Convertio 格式转换 · 驱动中心 · 设置...`);
  await page.goto('http://localhost:3000/convert', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  await injectMasterHUD(page, '第五章：一站式实用生态', 'Convertio 全格式转换 · 驱动官方直达 · 网络工具');
  await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }));
  await smoothMove(page, 960, 450, 500);
  await page.waitForTimeout(3500);

  await page.goto('http://localhost:3000/drivers', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }));
  await smoothMove(page, 600, 450, 500);
  await page.waitForTimeout(3000);

  while ((Date.now() - startTimeline) < 148700) {
    await page.waitForTimeout(300);
  }

  // ==================== 第 6 幕：价值总结定格 (148.7s - 155.0s | 6.3 秒) ====================
  console.log(`\n▶️ [第 6 幕 | 148.7s - 155.0s] 返回首页定格完成全流程总结...`);
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  await injectMasterHUD(page, '开启 10 倍效率时代', 'GitHub 开源免费 · 重塑你的日常生产力');
  await smoothMove(page, 960, 540, 500);

  while ((Date.now() - startTimeline) < 155000) {
    await page.waitForTimeout(300);
  }

  const videoObj = page.video();
  console.log(`\n💾 全流程精准实操完毕！关闭应用并保存视频...`);
  await app.close();

  let recordedPath = null;
  if (videoObj) {
    recordedPath = await videoObj.path();
    console.log(`📹 捕获到 2分35秒 原生同步视频: ${recordedPath}`);
  }

  // FFmpeg 音画混流
  if (recordedPath && fs.existsSync(recordedPath)) {
    const finalMp4 = path.join(videosDir, 'ai-toolbox-master-full-tutorial.mp4');
    const finalMp4Native = path.join(videosDir, 'ai-toolbox-native-electron-master.mp4');

    const pythonMuxScript = `
import os
import subprocess
import imageio_ffmpeg

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
v_in = r'${recordedPath.replace(/\\/g, '\\\\')}'
a_in = r'${masterVoiceover.replace(/\\/g, '\\\\')}'
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
    import shutil
    shutil.copyfile(v_out, r'${finalMp4Native.replace(/\\/g, '\\\\')}')
    print(f"🎉 2分35秒三栏+总结大面板黄金版生成成功: {v_out} ({os.path.getsize(v_out)} 字节)")
    probe = subprocess.run([ffmpeg, '-i', v_out], capture_output=True, text=True, encoding='utf-8', errors='ignore')
    for line in probe.stderr.split('\\n'):
        if 'Duration' in line:
            print('VERIFIED FINAL DURATION:', line.strip())
`;
    execSync(`python -c "${pythonMuxScript}"`, { stdio: 'inherit' });
  }
}

recordPerfectSyncMaster().catch(err => {
  console.error('❌ 执行失败:', err);
  process.exit(1);
});
