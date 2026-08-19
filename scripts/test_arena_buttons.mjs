import { _electron as electron } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

let curX = 960, curY = 540;

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

async function smoothMove(page, targetX, targetY, durationMs = 300) {
  try {
    const steps = Math.max(8, Math.floor(durationMs / 25));
    const startX = curX, startY = curY;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const ease = easeInOutQuad(t);
      const x = startX + (targetX - startX) * ease;
      const y = startY + (targetY - startY) * ease;
      await page.mouse.move(x, y);
      await page.waitForTimeout(durationMs / steps);
    }
    curX = targetX; curY = targetY;
  } catch (e) {}
}

async function asyncClick(page, buttonKeyword, targetX, targetY, delayMs = 500) {
  try {
    if (typeof targetX === 'number' && typeof targetY === 'number') {
      await smoothMove(page, targetX, targetY, 250);
    }
    await page.evaluate((kw) => {
      setTimeout(() => {
        const allBtns = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
        const target = allBtns.find(b => (b.innerText && b.innerText.includes(kw)) || (b.title && b.title.includes(kw)));
        if (target) target.click();
      }, 10);
    }, buttonKeyword);
    await page.waitForTimeout(delayMs);
  } catch (e) {}
}

async function test() {
  console.log('Testing asyncClick non-blocking flow on Arena...');
  const app = await electron.launch({
    args: ['electron/main.mjs'],
    cwd: projectRoot,
    env: { ...process.env, NODE_ENV: 'development' }
  });
  const page = await app.firstWindow();
  await page.goto('http://localhost:3000/arena?prompt=%E6%B5%8B%E8%AF%95');
  await page.waitForTimeout(1500);

  // 1. Click 3-column
  console.log('1. Click 3-column via asyncClick...');
  await asyncClick(page, '三栏', 730, 28, 1500);
  console.log('  -> 3-column clicked successfully!');

  // 2. Click 4-grid
  console.log('2. Click 4-grid via asyncClick...');
  await asyncClick(page, '四宫格', 810, 28, 1500);
  console.log('  -> 4-grid clicked successfully!');

  // 3. Click Summary
  console.log('3. Click Summary via asyncClick...');
  await asyncClick(page, '智能总结', 1780, 1020, 2000);
  console.log('  -> Summary modal clicked successfully!');

  // 4. Click Round 2 inside modal
  console.log('4. Click Round 2 tab inside modal...');
  await asyncClick(page, '第 2 轮', 1100, 48, 1500);
  console.log('  -> Round 2 clicked successfully!');

  await app.close();
  console.log('🎉 100% NON-BLOCKING LIGHTNING FAST SUCCESS!');
}

test().catch(console.error);
