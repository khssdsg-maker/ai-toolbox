import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const vDir = path.join(projectRoot, 'videos');

const files = fs.readdirSync(vDir).filter(f => f.endsWith('.webm'));
if (files.length > 0) {
  const latestWebm = path.join(vDir, files[files.length - 1]);
  const destWebm = path.join(vDir, 'ai-toolbox-showcase-1080p.webm');
  fs.copyFileSync(latestWebm, destWebm);
  console.log('✅ 已保存标准化 WebM:', destWebm);

  // 寻找 Playwright 下载的 FFmpeg
  const localAppData = process.env.LOCALAPPDATA || '';
  const playwrightDir = path.join(localAppData, 'ms-playwright');
  let ffmpegPath = '';
  
  if (fs.existsSync(playwrightDir)) {
    const subdirs = fs.readdirSync(playwrightDir);
    for (const d of subdirs) {
      if (d.startsWith('ffmpeg')) {
        const candidate = path.join(playwrightDir, d, 'ffmpeg.exe');
        if (fs.existsSync(candidate)) {
          ffmpegPath = candidate;
          break;
        }
      }
    }
  }

  if (ffmpegPath) {
    const destMp4 = path.join(vDir, 'ai-toolbox-showcase-1080p.mp4');
    console.log(`🎬 正在通过 FFmpeg 转码为高兼容 MP4 (H.264)...`);
    const cmd = `"${ffmpegPath}" -y -i "${destWebm}" -c:v libx264 -pix_fmt yuv420p "${destMp4}"`;
    execSync(cmd, { stdio: 'inherit' });
    console.log('🎉 MP4 视频转码完成:', destMp4);
  } else {
    console.log('ℹ️ 未检测到本地 ffmpeg.exe，WebM 文件可直接使用 Chrome / Edge 播放');
  }
}
