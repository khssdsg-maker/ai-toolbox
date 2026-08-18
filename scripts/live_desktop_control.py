import os
import sys
import time
import threading
import subprocess

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import cv2
import numpy as np
import mss
import pyautogui

pyautogui.FAILSAFE = True
pyautogui.PAUSE = 0.2

# 项目根路径与视频输出
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIDEOS_DIR = os.path.join(PROJECT_ROOT, "videos")
os.makedirs(VIDEOS_DIR, exist_ok=True)
OUTPUT_VIDEO_PATH = os.path.join(VIDEOS_DIR, "real-desktop-live-showcase.mp4")

# 全局录制控制开关
is_recording = True

def screen_recorder_worker(output_path, fps=30):
    """后台独立线程：实时抓取 Windows 主显示器并写入 MP4 视频"""
    global is_recording
    with mss.mss() as sct:
        # 获取主显示器边界
        monitor = sct.monitors[1]
        width = monitor["width"]
        height = monitor["height"]
        
        # 使用 standard MP4V 编码器
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        frame_interval = 1.0 / fps
        print(f"[REC] Screen recorder started. Resolution: {width}x{height} @ {fps}fps")
        
        while is_recording:
            start_time = time.time()
            img = np.array(sct.grab(monitor))
            # RGBA 转 BGR
            frame = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
            out.write(frame)
            
            elapsed = time.time() - start_time
            sleep_time = frame_interval - elapsed
            if sleep_time > 0:
                time.sleep(sleep_time)
                
        out.release()
        print(f"[REC] Screen recorder saved to: {output_path}")

def main():
    global is_recording
    
    screen_w, screen_h = pyautogui.size()
    print(f"\n=======================================================")
    print(f"🖥️  [真机实控与实屏录制] 即将接管物理鼠标与键盘")
    print(f"📐 当前检测到主屏幕分辨率: {screen_w} x {screen_h}")
    print(f"📹 录屏文件将保存至: {OUTPUT_VIDEO_PATH}")
    print(f"=======================================================\n")
    
    # 1. 启动屏幕录制线程
    rec_thread = threading.Thread(target=screen_recorder_worker, args=(OUTPUT_VIDEO_PATH, 30))
    rec_thread.daemon = True
    rec_thread.start()
    time.sleep(1.0)
    
    # 2. 真实唤起前台浏览器窗口并全屏显示应用
    print("[1/6] 正在唤起《AI万能工具箱》原生窗口至前台...")
    # 使用 Windows 默认浏览器以 App 纯净窗口模式打开 localhost:3000
    try:
        subprocess.Popen(["cmd", "/c", "start", "msedge", "--app=http://localhost:3000", "--start-maximized"], shell=True)
    except Exception:
        subprocess.Popen(["cmd", "/c", "start", "http://localhost:3000"], shell=True)
        
    time.sleep(4.0) # 等待窗口渲染
    
    # 3. 场景 1: 鼠标在主页滑动、点击搜索框并打字
    print("[2/6] 物理操控：移动鼠标至搜索框并输入 'DeepSeek'...")
    search_x = int(screen_w * 0.50)
    search_y = int(screen_h * 0.22)
    pyautogui.moveTo(search_x, search_y, duration=1.2, tween=pyautogui.easeInOutQuad)
    pyautogui.click()
    time.sleep(0.5)
    
    # 真实逐字输入
    pyautogui.write("DeepSeek", interval=0.12)
    time.sleep(1.5)
    
    # 鼠标滑至筛选出的卡片
    card_x = int(screen_w * 0.35)
    card_y = int(screen_h * 0.40)
    pyautogui.moveTo(card_x, card_y, duration=0.8, tween=pyautogui.easeInOutQuad)
    time.sleep(1.5)
    
    # 清空搜索框
    pyautogui.moveTo(search_x, search_y, duration=0.6, tween=pyautogui.easeInOutQuad)
    pyautogui.click()
    pyautogui.hotkey('ctrl', 'a')
    pyautogui.press('backspace')
    time.sleep(1.0)
    
    # 4. 场景 2: 物理点击左侧胶囊栏【提示词灵感宝典】
    print("[3/6] 物理操控：点击左侧导航栏【提示词灵感宝典】...")
    prompts_nav_x = int(screen_w * 0.045)
    prompts_nav_y = int(screen_h * 0.40)
    pyautogui.moveTo(prompts_nav_x, prompts_nav_y, duration=1.0, tween=pyautogui.easeInOutQuad)
    pyautogui.click()
    time.sleep(3.0)
    
    # 鼠标滚动浏览提示词模板
    pyautogui.moveTo(int(screen_w * 0.5), int(screen_h * 0.5), duration=0.6)
    pyautogui.scroll(-350)
    time.sleep(1.5)
    pyautogui.scroll(350)
    time.sleep(1.0)
    
    # 5. 场景 3: 物理点击左侧胶囊栏【大模型分屏对比台 (/arena)】
    print("[4/6] 物理操控：点击进入【AI 大模型分屏对比台】...")
    arena_nav_x = int(screen_w * 0.045)
    arena_nav_y = int(screen_h * 0.46)
    pyautogui.moveTo(arena_nav_x, arena_nav_y, duration=1.0, tween=pyautogui.easeInOutQuad)
    pyautogui.click()
    time.sleep(3.5)
    
    # 鼠标移动到模型窗口并模拟比对
    model_1_x = int(screen_w * 0.30)
    model_1_y = int(screen_h * 0.45)
    pyautogui.moveTo(model_1_x, model_1_y, duration=1.0, tween=pyautogui.easeInOutQuad)
    time.sleep(2.0)
    
    model_2_x = int(screen_w * 0.70)
    model_2_y = int(screen_h * 0.45)
    pyautogui.moveTo(model_2_x, model_2_y, duration=1.0, tween=pyautogui.easeInOutQuad)
    time.sleep(2.0)
    
    # 6. 场景 4: 物理点击【文件转换】与返回主页
    print("[5/6] 物理操控：切换文件转换中心与超级生态...")
    convert_nav_x = int(screen_w * 0.045)
    convert_nav_y = int(screen_h * 0.52)
    pyautogui.moveTo(convert_nav_x, convert_nav_y, duration=1.0, tween=pyautogui.easeInOutQuad)
    pyautogui.click()
    time.sleep(3.0)
    
    # 返回主页定格
    print("[6/6] 物理操控：返回首页完成演示...")
    home_nav_x = int(screen_w * 0.045)
    home_nav_y = int(screen_h * 0.34)
    pyautogui.moveTo(home_nav_x, home_nav_y, duration=1.0, tween=pyautogui.easeInOutQuad)
    pyautogui.click()
    time.sleep(2.0)
    
    # 鼠标平滑回到屏幕中央
    pyautogui.moveTo(int(screen_w * 0.50), int(screen_h * 0.50), duration=1.0, tween=pyautogui.easeInOutQuad)
    time.sleep(2.5)
    
    # 停止录制
    print("\n💾 演示结束，正在停止屏幕录制并封装 MP4 视频...")
    is_recording = False
    rec_thread.join(timeout=5.0)
    
    print(f"\n🎉 [真机实控与实屏录制完成] 视频已生成: {OUTPUT_VIDEO_PATH}")

if __name__ == "__main__":
    main()
