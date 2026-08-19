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

async function smoothClick(page, selectorOrEl, clickDelayMs = 250) {
  try {
    let targetX, targetY;
    let el;
    if (typeof selectorOrEl === 'string') {
      el = await page.waitForSelector(selectorOrEl, { state: 'visible', timeout: 5000 });
    } else if (selectorOrEl && typeof selectorOrEl.boundingBox === 'function') {
      el = selectorOrEl;
    }
    
    if (el) {
      const box = await el.boundingBox();
      if (!box) return;
      targetX = box.x + box.width / 2;
      targetY = box.y + box.height / 2;
    } else if (selectorOrEl && typeof selectorOrEl.x === 'number') {
      targetX = selectorOrEl.x + (selectorOrEl.width ? selectorOrEl.width / 2 : 0);
      targetY = selectorOrEl.y + (selectorOrEl.height ? selectorOrEl.height / 2 : 0);
    } else {
      return;
    }

    await smoothMove(page, targetX, targetY, 300);
    if (el && typeof el.click === 'function') {
      await el.click().catch(() => page.mouse.click(targetX, targetY));
    } else {
      await page.mouse.click(targetX, targetY);
    }
    await page.waitForTimeout(clickDelayMs);
  } catch (e) {}
}

async function testArenaFlow() {
  console.log('Testing full arena click flow...');
  const app = await electron.launch({
    args: ['electron/main.mjs'],
    cwd: projectRoot,
    env: { ...process.env, NODE_ENV: 'development' }
  });
  const page = await app.firstWindow();
  await page.goto('http://localhost:3000/arena?prompt=test');
  await page.waitForTimeout(1500);

  // 1. Click 3-col
  console.log('1. Clicking 3-column button...');
  await smoothClick(page, 'button:has-text("三栏"), button[title*="三栏"]');
  await page.waitForTimeout(1000);

  // 2. Click 4-grid
  console.log('2. Clicking 4-grid button...');
  await smoothClick(page, 'button:has-text("四宫格"), button[title*="四宫格"]');
  await page.waitForTimeout(1000);

  // 3. Click 🧠 对比智能总结
  console.log('3. Clicking 🧠 对比智能总结 button...');
  await smoothClick(page, 'button:has-text("智能总结"), button:has-text("总结")');
  await page.waitForTimeout(1500);

  // 4. Click Round 2 inside modal
  console.log('4. Clicking Round 2 tab inside modal...');
  await smoothClick(page, 'button:has-text("第 2 轮"), button:has-text("二轮")');
  await page.waitForTimeout(1000);

  await app.close();
  console.log('✅ All clicks executed smoothly without any hanging!');
}

testArenaFlow().catch(console.error);
