import asyncio
import os
import sys
import subprocess
import imageio_ffmpeg
import edge_tts

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

VOICE = "zh-CN-YunxiNeural"
RATE = "+6%"
PITCH = "+0Hz"

CHAPTERS = [
    # 第 1 幕：首页超级生态 (25s)
    ("ch1.mp3", "欢迎体验 AI万能工具箱！在人工智能工具大爆发的今天，开发者和日常用户经常要在数十个网页书签和窗口之间反复横跳，不仅操作割裂，更浪费了宝贵的深度心流时间。AI万能工具箱正是为您打造的一站式超级生产力中枢。首先看到首页的超级生态矩阵。这里精心收录并分类了 AI 对话、AI 编程、AI 写作与小说生成、AI 设计绘画等各大核心领域。不仅聚合了全球主流大厂服务，更深度收录了数万星标的高口碑开源项目。配合免翻墙高速 CDN 与本地零闪烁缓存技术，所有卡片秒级直达。顶部的全局搜索框支持极速检索，输入关键字例如 Claude，瞬间精准定位。"),
    
    # 第 2 幕：提示词宝典 (25s)
    ("ch2.mp3", "接下来，进入【AI 提示词灵感宝典】。优质的提示词是释放大模型潜力的关键。本模块精选整合了全球十一大顶尖 Prompt 平台，并覆盖小说写作、代码重构等五大高频实战场景。在模板中填入具体的业务参数，比如高并发微服务重构，点击卡片上的分屏对比按钮，提示词就会带着参数一键秒级直传到大模型对比台！"),
    
    # 第 3 幕：分屏对比台 (30s)
    ("ch3.mp3", "现在来到了核心王炸——【AI 大模型分屏对比台】！面对复杂的工程与创作任务，单一模型往往存在局限与幻觉。在这里，您可以同时唤醒 DeepSeek R1、ChatGPT、Claude 以及 Kimi 等十多款顶流大模型。界面支持双栏无级拖拽、三栏并排以及四宫格全开矩阵。内置独立沙箱与底层反风控绕过机制，免登录防拦截，让多模型同台竞技丝滑无阻！"),
    
    # 第 4 幕：双区研判中枢 (20s)
    ("ch4.mp3", "紧接着，为您展示 v1.5.2 独家上线的【双区多模型研判协同中枢】！左侧为主屏原始答卷池，自动提取各家模型的完整正文与字数；右侧常驻独立的【总审官大模型视窗】，专职进行深度剖析与冲突裁决，快速提炼共识，更能一键生成并动态派发第二轮定向攻坚指令，带领各大模型实现协同进化！"),
    
    # 第 5 幕：实用生态 (15s)
    ("ch5.mp3", "除了强大的 AI 矩阵，工具箱还内置了 Convertio 全能文件转换中心、驱动官方直达以及实用网络工具；点击系统设置，更可随时切换深色与浅色主题。"),
    
    # 第 6 幕：总结 (8s)
    ("ch6.mp3", "完全开源免费，即刻前往 GitHub 下载体验，开启您的十倍效率时代！")
]

async def main():
    out_dir = os.path.abspath("videos/audio")
    os.makedirs(out_dir, exist_ok=True)
    temp_files = []
    
    print("[1/2] Generating individual chapter audios...")
    for filename, text in CHAPTERS:
        fp = os.path.join(out_dir, filename)
        comm = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
        await comm.save(fp)
        temp_files.append(fp)
        print(f"  -> Generated {filename} ({os.path.getsize(fp)} bytes)")
        
    # 合并为完整 120s 音频
    print("[2/2] Merging all chapters with FFmpeg...")
    final_mp3 = os.path.join(out_dir, "showcase-120s-voiceover.mp3")
    list_txt = os.path.join(out_dir, "concat_list.txt")
    with open(list_txt, "w", encoding="utf-8") as f:
        for tf in temp_files:
            f.write(f"file '{tf.replace(chr(92), '/')}'\n")
            
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [ffmpeg, "-y", "-f", "concat", "-safe", "0", "-i", list_txt, "-c", "copy", final_mp3]
    subprocess.run(cmd, capture_output=True, check=True)
    
    # 打印精确总时长
    res = subprocess.run([ffmpeg, "-i", final_mp3], capture_output=True, text=True, errors="ignore")
    for line in res.stderr.split("\n"):
        if "Duration" in line:
            print("🎉 FULL 120S AUDIO GENERATED SUCCESSFULLY:", line.strip())

if __name__ == "__main__":
    asyncio.run(main())
