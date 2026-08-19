import asyncio
import os
import sys
import edge_tts

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

VOICE = "zh-CN-YunxiNeural"
RATE = "+18%"  # 提速 18%，节奏紧凑利落、高能明快
PITCH = "+0Hz"

SCRIPT_90S = """
欢迎体验 AI万能工具箱！告别杂乱的网页书签与频繁切屏，这是一站式解决找工具、转文件、装驱动、问大模型的全能超级中枢。

首先看首页：这里汇聚全球优质大模型与高星开源工具，涵盖对话、编程、写作与小说等各大核心分类，免翻墙 CDN 与本地零闪烁缓存秒级直达。顶部搜索框输入关键字例如 Claude，瞬间精准定位。

接着进入【AI 提示词灵感宝典】：收录全球 11 大顶尖平台与高频实战场景。在模板中填入具体需求，点击分屏对比按钮，提示词一键秒级直传到对比台！

来到核心王炸【AI 大模型分屏对比台】：支持 DeepSeek R1、ChatGPT、Claude、Kimi 等十多款顶流大模型同台竞技！双栏自由拖拽、三栏与四宫格矩阵随心切换，内置沙箱底层反风控，免登录防拦截。

更独创 v1.5.2【双区研判协同中枢】：左侧自动提取全量回答，右侧独立总审官大模型专职深度剖析与冲突裁决，一键派发第二轮攻坚！

更有 Convertio 全格式转换与驱动工具一网打尽。完全开源免费，立即前往 GitHub 下载体验，重夺你的十倍效率时代！
"""

async def generate():
    output_dir = os.path.join(os.path.dirname(__file__), "..", "videos", "audio")
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, "showcase-90s-voiceover.mp3")
    
    print("[TTS] Generating 90s fast-paced voiceover...")
    comm = edge_tts.Communicate(SCRIPT_90S.strip(), VOICE, rate=RATE, pitch=PITCH)
    await comm.save(out_path)
    print(f"[OK] Saved: {out_path}")

if __name__ == "__main__":
    asyncio.run(generate())
