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
const masterVoiceover = path.join(audioDir, 'master-full-tutorial-voiceover.mp3');

if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

const TARGET_URL = 'http://localhost:3000';

console.log(`========================================================================`);
console.log(`🎬 [AI万能工具箱] 全功能深度精讲大师版长视频录制流水线 (约 3 分 50 秒)`);
console.log(`🎙️ 原生科技解说音轨: ${masterVoiceover}`);
console.log(`🔊 扬声器实时外放 + 全深度真实交互 + FFmpeg 高清音画混流`);
console.log(`========================================================================\n`);

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

async function smoothClick(page, selectorOrBox, clickDelayMs = 300) {
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

    await smoothMove(page, targetX, targetY, 450);
    await page.evaluate(({ cx, cy }) => {
      const r = document.createElement('div');
      r.className = 'click-ripple';
      r.style.left = `${cx}px`; r.style.top = `${cy}px`;
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 600);
    }, { cx: targetX, cy: targetY }).catch(() => {});

    await page.mouse.click(targetX, targetY);
    await page.waitForTimeout(clickDelayMs);
  } catch (e) {}
}

async function humanType(page, text, intervalMs = 90) {
  for (const char of text) {
    await page.keyboard.type(char);
    await page.waitForTimeout(intervalMs);
  }
  await page.waitForTimeout(300);
}

async function injectMasterStudio(page, chapterTitle, chapterSub) {
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
          transition: transform 0.03s linear;
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
          animation: rippleEffect 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes rippleEffect {
          0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; border-color: #00f2fe; }
          100% { transform: translate(-50%, -50%) scale(2.4); opacity: 0; border-color: #4facfe; }
        }
        #master-hud-badge {
          position: fixed;
          top: 24px;
          right: 36px;
          background: rgba(10, 15, 29, 0.92);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(0, 242, 254, 0.4);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7), 0 0 24px rgba(0, 242, 254, 0.25);
          color: #f8fafc;
          padding: 12px 28px;
          border-radius: 40px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          z-index: 999990;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        #master-hud-badge .badge-tag {
          padding: 4px 12px;
          border-radius: 20px;
          background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
          color: #050811;
          font-weight: 800;
          font-size: 13px;
        }
        #master-hud-badge .title {
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
        }
        #master-hud-badge .sub {
          font-size: 13px;
          color: #94a3b8;
        }
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
      let hud = document.getElementById('master-hud-badge');
      if (!hud) {
        hud = document.createElement('div');
        hud.id = 'master-hud-badge';
        document.body.appendChild(hud);
      }
      hud.innerHTML = `
        <span class="badge-tag">MASTER TUTORIAL</span>
        <div><span class="title">${title}</span><span class="sub"> · ${sub}</span></div>
      `;
    }, { title: chapterTitle, sub: chapterSub });
  } catch (e) {}
}

async function runMasterRecording() {
  // 1. 启动 Windows 扬声器实时外放解说
  console.log(`🎙️ 正在启动扬声器全流程连续解说外放...`);
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
        time.sleep(0.5)
except Exception:
    subprocess.run(['powershell', '-c', f'''
        $wmp = New-Object -ComObject wmplayer.ocx
        $wmp.URL = "{audio_path}"
        $wmp.controls.play()
        Start-Sleep -Seconds 240
    '''], shell=True)
`], { detached: true, stdio: 'ignore' });
  } catch (e) {}

  // 2. 启动可视化前台 Chromium 窗口
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

  // ==================== 第一章：首页超级生态与极速筛选 (0:00 - 0:32) ====================
  console.log(`▶️ [第一章: 0:00 - 0:32] 首页超级生态与分类流转...`);
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await injectMasterStudio(page, '第一章：首页超级生态', '7大分类 · 开源主流全收录 · 秒级直达');

  // 鼠标滑过顶部分类
  await smoothMove(page, 550, 160, 600);
  await page.waitForTimeout(1200);

  // 真实点击【AI 写作与小说生成】分类
  try {
    const novelTab = await page.$('button:has-text("写作"), button:has-text("小说"), div:has-text("写作")');
    if (novelTab) {
      await smoothClick(page, novelTab);
      await page.waitForTimeout(2500);
    }
  } catch (e) {}

  // 悬停在小说卡片上
  await smoothMove(page, 450, 380, 700);
  await page.waitForTimeout(2000);

  // 真实点击【AI 编程工具】分类
  try {
    const codeTab = await page.$('button:has-text("编程"), div:has-text("编程")');
    if (codeTab) {
      await smoothClick(page, codeTab);
      await page.waitForTimeout(2500);
    }
  } catch (e) {}

  // 搜索框输入 Claude
  const searchInput = 'input[placeholder*="搜索"], input[type="search"], input[type="text"]';
  try {
    await smoothClick(page, searchInput);
    await humanType(page, 'Claude', 100);
    await page.waitForTimeout(2500);
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(1500);
  } catch (e) {}

  // ==================== 第二章：AI 提示词灵感宝典深度实操 (0:32 - 1:18) ====================
  console.log(`▶️ [第二章: 0:32 - 1:18] 提示词灵感宝典深度实操与动态参数直通...`);
  await page.goto(`${TARGET_URL}/prompts`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await injectMasterStudio(page, '第二章：提示词灵感宝典', '11大平台 · 5大场景模板 · 动态参数秒级直传');

  // 浏览 11 大平台
  await smoothMove(page, 960, 260, 600);
  await page.waitForTimeout(2000);

  // 滚动浏览 5 大场景
  await page.mouse.wheel(0, 350);
  await page.waitForTimeout(2500);

  // 寻找变量输入框并填入真实业务参数
  try {
    const varInputs = await page.$$('input[placeholder*="默认值"], input[placeholder*="参数"], input.bg-background');
    if (varInputs.length > 0) {
      await smoothClick(page, varInputs[0]);
      await page.keyboard.press('Control+A');
      await humanType(page, '高并发订单中台重构与性能优化', 80);
      await page.waitForTimeout(2000);
    }

    // 寻找卡片上的 [分屏对比] 按钮并真实点击
    const arenaBtns = await page.$$('button:has-text("分屏对比"), a[href*="arena"]');
    if (arenaBtns.length > 0) {
      await smoothClick(page, arenaBtns[0]);
      await page.waitForTimeout(2000);
    } else {
      await page.goto(`${TARGET_URL}/arena?prompt=%E9%AB%98%E5%B9%B6%E5%8F%91%E8%AE%A2%E5%8D%95%E4%B8%AD%E5%8F%B0%E9%87%8D%E6%9E%84`, { waitUntil: 'domcontentloaded' });
    }
  } catch (e) {
    await page.goto(`${TARGET_URL}/arena`, { waitUntil: 'domcontentloaded' });
  }

  // ==================== 第三章：AI 大模型分屏对比台 /arena (1:18 - 2:15) ====================
  console.log(`▶️ [第三章: 1:18 - 2:15] AI 大模型分屏对比台与多屏矩阵切换...`);
  await page.waitForTimeout(1000);
  await injectMasterStudio(page, '第三章：大模型分屏对比台', '10+ 顶流模型 · 双栏/三栏/四宫格 · 底层反风控');

  // 展示输入框带入的 Prompt
  await smoothMove(page, 960, 140, 500);
  await page.waitForTimeout(3000);

  // 真实切换分屏布局按钮（三栏、四宫格、双栏）
  try {
    const buttons = await page.$$('button:has(svg)');
    for (let btn of buttons) {
      const title = await btn.getAttribute('title') || '';
      if (title.includes('三') || title.includes('3')) {
        await smoothClick(page, btn);
        await page.waitForTimeout(3000);
        break;
      }
    }
    for (let btn of buttons) {
      const title = await btn.getAttribute('title') || '';
      if (title.includes('四') || title.includes('网格') || title.includes('4')) {
        await smoothClick(page, btn);
        await page.waitForTimeout(3500);
        break;
      }
    }
  } catch (e) {}

  // 悬停在四宫格各模型窗口
  await smoothMove(page, 500, 420, 700);
  await page.waitForTimeout(3000);
  await smoothMove(page, 1380, 420, 700);
  await page.waitForTimeout(3000);
  await smoothMove(page, 500, 780, 700);
  await page.waitForTimeout(3000);
  await smoothMove(page, 1380, 780, 700);
  await page.waitForTimeout(3500);

  // ==================== 第四章：v1.5.2 独家双区研判协同中枢 (2:15 - 2:58) ====================
  console.log(`▶️ [第四章: 2:15 - 2:58] v1.5.2 独家双区研判中枢与总审官冲突裁决...`);
  await injectMasterStudio(page, '第四章：双区多模型研判协同中枢', 'v1.5.2 独家 · 正文自动提取 · 独立总审官二轮攻坚');

  // 点击【研判协同】按钮唤起中枢
  try {
    const hubBtn = await page.$('button:has-text("研判"), button:has-text("协同"), button:has-text("分析")');
    if (hubBtn) {
      await smoothClick(page, hubBtn);
      await page.waitForTimeout(3000);
    }
  } catch (e) {}

  // 鼠标移动到左侧原始答卷池
  await smoothMove(page, 450, 480, 700);
  await page.waitForTimeout(4000);

  // 鼠标移动到右侧独立总审官大模型视窗
  await smoothMove(page, 1450, 480, 700);
  await page.waitForTimeout(4500);

  // 模拟点击触发二轮定向攻坚
  try {
    const round2Btn = await page.$('button:has-text("二轮"), button:has-text("攻坚"), button:has-text("深化")');
    if (round2Btn) {
      await smoothClick(page, round2Btn);
      await page.waitForTimeout(3000);
    }
  } catch (e) {}

  // ==================== 第五章：全能实用生态与系统设置 (2:58 - 3:30) ====================
  console.log(`▶️ [第五章: 2:58 - 3:30] 全能生态服务（格式转换/驱动/网络/系统设置）...`);

  // 切换到 Convertio 格式转换
  await page.goto(`${TARGET_URL}/convert`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await injectMasterStudio(page, '第五章：一站式实用生态', 'Convertio 格式转换 · 驱动官方下载 · 网络工具');
  await smoothMove(page, 960, 450, 600);
  await page.waitForTimeout(3500);

  // 切换到 驱动中心
  await page.goto(`${TARGET_URL}/drivers`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await injectMasterStudio(page, '第五章：一站式实用生态', '主流硬件驱动官方一键直达');
  await smoothMove(page, 600, 450, 600);
  await page.waitForTimeout(3500);

  // 切换到 网络工具
  await page.goto(`${TARGET_URL}/tools`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await injectMasterStudio(page, '第五章：一站式实用生态', '精选直连网络站长工具');
  await smoothMove(page, 800, 450, 600);
  await page.waitForTimeout(3500);

  // 打开系统设置弹窗
  try {
    const settingsBtn = await page.$('aside button[title*="设置"], button:has(svg.lucide-settings)');
    if (settingsBtn) {
      await smoothClick(page, settingsBtn);
      await page.waitForTimeout(2500);
      // 关闭设置弹窗
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
  } catch (e) {}

  // ==================== 第六章：开源价值收拢与总结 (3:30 - 3:52) ====================
  console.log(`▶️ [第六章: 3:30 - 3:52] 价值升华与品牌收拢定格...`);
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await injectMasterStudio(page, '第六章：开启 10 倍效率时代', 'GitHub 开源免费 · 重塑你的日常生产力');

  await smoothMove(page, 960, 540, 600);
  await page.waitForTimeout(10000); // 稳稳等待解说全部结束

  console.log(`💾 全部录制完成，正在关闭浏览器并封包视频...`);
  await page.close();
  await context.close();
  await browser.close();

  // 合成音画
  console.log(`🎬 正在使用 Python FFmpeg 进行高保真音画同步合成...`);
  const rawFiles = fs.readdirSync(videosDir).filter(f => f.startsWith('page@') && f.endsWith('.webm'));
  if (rawFiles.length > 0) {
    const rawWebm = path.join(videosDir, rawFiles[rawFiles.length - 1]);
    const finalMp4 = path.join(videosDir, 'ai-toolbox-master-full-tutorial.mp4');

    const pythonMuxScript = `
import os
import subprocess
import imageio_ffmpeg

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
v_in = r'${rawWebm.replace(/\\/g, '\\\\')}'
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
print("Muxing video and audio...")
res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
if res.returncode == 0:
    print(f"🎉 MASTER TUTORIAL READY: {v_out} ({os.path.getsize(v_out)} bytes)")
else:
    print("Mux error:", res.stderr)
`;
    execSync(`python -c "${pythonMuxScript}"`, { stdio: 'inherit' });
    try { fs.unlinkSync(rawWebm); } catch (e) {}
  }
}

runMasterRecording().catch(err => {
  console.error('❌ 大师版录制执行失败:', err);
  process.exit(1);
});
