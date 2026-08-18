import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const audioPath = path.resolve(__dirname, '../videos/audio/live-showcase-voiceover.mp3');

async function testSound() {
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--autoplay-policy=no-user-gesture-required',
      '--no-sandbox'
    ]
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  const b64 = fs.readFileSync(audioPath).toString('base64');

  console.log('🔊 Testing audio playback through speakers...');
  await page.setContent(`
    <html>
      <body style="background:#090a0f; color:#fff; display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif;">
        <h1>🔊 正在外放解说音频测试...</h1>
      </body>
    </html>
  `);

  await page.evaluate((data) => {
    const audio = new Audio(`data:audio/mp3;base64,${data}`);
    audio.volume = 1.0;
    audio.play();
  }, b64);

  await page.waitForTimeout(4000);
  await browser.close();
  console.log('✅ Sound test finished.');
}

testSound();
